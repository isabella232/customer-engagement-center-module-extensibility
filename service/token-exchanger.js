const request = require("request")
const xsenv = require("@sap/xsenv")
const xssec = require("@sap/xssec")

module.exports = {

    /**
     * The initialize function returns a express middleware which catches all requests
     * to exchange the jwt-token and the security context (req.authInfo). 
     */
    initialize: () => {
        const xsuaaConfig = xsenv.getServices({ uaa: { tag: "xsuaa" } }).uaa;

        return async (req, res, next) => {

            console.log('CEC jwt access-token: ' + req.authInfo.token);

            // Extract the jwt access-token that should be exchanged from the header
            const cecToken = req.get('Authorization').split(' ')[1];

            // Do at first a user-token grant request to get the refresh-token that is required to exchange
            // the cec jwt access-token.
            const refreshToken = await requestRefreshToken(xsuaaConfig.url, xsuaaConfig.clientid, cecToken);
            
            // Do a refresh-token grant request to exchange the cec token with a new one that is created by
            // customer-xsuaa instance that includes the customers scopes
            const customerToken = await requestCustomerXSUAAToken(xsuaaConfig.url, xsuaaConfig.clientid, xsuaaConfig.clientsecret, refreshToken);

            // Create a new security context based on the new jwt access-token (in req.authInfo), so the
            // authorization can be processed as usual.
            xssec.createSecurityContext(customerToken, xsuaaConfig, function (error, securityContext) {
                // If creation of Security Context failed.
                if (error) { return next(error); }

                console.log('Customer jwt access-token: ' + securityContext.token);
                
                // Replace old security context with the new one
                req.audInfo = securityContext;
                next();
            });
        };
    }
};


/**
 * A function to process a UAA API call with the a user_token grant. Documentation: https://docs.cloudfoundry.org/api/uaa/version/4.24.0/index.html#refresh-token
 * 
 * @param {String} xsuaaUrl xsuaa api url. Can be found in the environment variables under VCAP_SERVICES -> xsuaa -> credentials -> url
 * @param {*} clientId Can be found in the environment variables under VCAP_SERVICES -> xsuaa -> credentials -> clientid
 * @param {*} cecToken The jwt access-token comming from customer engagement center
 */
const requestRefreshToken = (xsuaaUrl, clientId, cecToken) => {

    const options = {
        method: 'POST',
        url: xsuaaUrl + '/oauth/token',
        headers: {
            'Authorization': 'Bearer ' + cecToken,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        form: {
            client_id: clientId,
            grant_type: 'user_token',
            response_type: 'token'
        }
    };

    return new Promise((resolve, reject) => {
        request(options, function (error, response, body) {
            if (error) reject(error);
            resolve(JSON.parse(body).refresh_token);
        });
    });
};

/**
 * A function to process a UAA Refresh-Token API call. Documentation: 
 * 
 * @param {*} xsuaaUrl xsuaa api url. Can be found in the environment variables under VCAP_SERVICES -> xsuaa -> credentials -> url
 * @param {*} clientId Can be found in the environment variables under VCAP_SERVICES -> xsuaa -> credentials -> clientid
 * @param {*} clientsecret Can be found in the environment variables under VCAP_SERVICES -> xsuaa -> credentials -> clientsecret
 * @param {*} refreshToken Can be obtained by processing the UAA API call with a user_token grant ( @see requestRefreshToken )
 */
const requestCustomerXSUAAToken = (xsuaaUrl, clientId, clientsecret, refreshToken) => {

    const base64OfClientIdSecret = new Buffer(clientId + ':' + clientsecret).toString('base64');

    const options = {
        method: 'POST',
        url: xsuaaUrl + '/oauth/token',
        headers: {
            'Authorization': 'Basic ' + base64OfClientIdSecret,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
        },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        }
    };

    return new Promise((resolve, reject) => {
        request(options, function (error, response, body) {
            if (error) reject(error);
            resolve(JSON.parse(body).access_token);
        });
    });
};