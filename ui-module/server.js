const express = require('express');
const app = express();
const auth = require('basic-auth');
const compare = require('tsscmp');
const port = process.env.PORT || 3001;

var cors = require('cors');
app.use(cors());

// This is just a simplified way on how to get these credentials!
const basicAuthName = process.env.BASIC_AUTH_NAME, basicAuthPassword = process.env.BASIC_AUTH_PASSWORD;
if(!basicAuthName || !basicAuthPassword){ throw Error('"basicAuthName" or "basicAuthPassword" value is missing in the environment variables.')}

// Middleware to perform Basic Authentication
app.use(function (req, res, next) {
  const credentials = auth(req)

  // Check credentials
  // The "check" function will typically be against your user store
  if (!credentials || !(compare(credentials.name, basicAuthName) && compare(credentials.pass, basicAuthPassword))) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="example"');
    res.end('Access denied');
  } else {
    next();
  };
});

app.use(express.static('public'));
app.listen(port, () => console.log(`Server listens on port ${port} - Service URL: http://localhost:${port}/`));
