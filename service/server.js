const express = require('express')
const xsenv = require("@sap/xsenv")
const xssec = require("@sap/xssec")
const passport = require("passport")
const bodyParser = require('body-parser');

const tokenExchanger = require('./token-exchanger');

// const cors = require('cors')
const app = express()
const port = process.env.PORT || 3000

app.use(bodyParser.json());

// Integrate the XSUAA service with PasswortJS and define the auth-strategy
const uaaConfig = xsenv.getServices({ uaa: { tag: "xsuaa" } }).uaa;
passport.use("JWT", new xssec.JWTStrategy(uaaConfig))

// Integrate passwortJS in expressJS
app.use(passport.initialize())

// Define, which auth-strategy you want to use
app.use(passport.authenticate("JWT", { session: false }))

/**
 * Use a middleware which exchanges the jwt access-token for any request.
 * 
 * You can also restrict this behavoir to requests with a specific url-path.
 * More can be found here: https://expressjs.com/en/guide/using-middleware.html
 */
app.use(tokenExchanger.initialize());


/**
 * Use a middleware to authorize the requests globally instead for each service-API.
 * You can change this behavoir for your needs. The most important part here is the codeline:
 * --> req.audInfo.checkLocalScope('scope')
 */
app.use((req, res, next) => {

    let isAuthorized = false;
    switch (req.method) {

        case 'GET':
            if (req.audInfo.checkLocalScope('or')) { isAuthorized = true; }
            break;

        case 'POST':
            if (req.audInfo.checkLocalScope('oc')) { isAuthorized = true; }
            break;

        case 'PUT':
            if (req.audInfo.checkLocalScope('ou')) { isAuthorized = true; }
            break;

        case 'DELETE':
            if (req.audInfo.checkLocalScope('od')) { isAuthorized = true; }
            break;

        default:
            res.status(405);
            res.send('Method Not Allowed');
            next();
            break;
    }

    if (!isAuthorized) {
        res.status(403);
        res.send('Access is denied');
    }
    next();
})


/**
 * Use the Order Router, which handles the order records with CRUD operation.
 */
const orderRouter = require('./order-router');
app.use(orderRouter);


app.listen(port, () => console.log(`Example app listening on port ${port}!`))