var express = require('express');
var graphAPIHit = require('./graphAPIHit');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var errorHandler = require('errorhandler');
var fbGraph = require('fbgraph');
var conf = require('./config/config');

var app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(methodOverride());
app.set('view engine', 'pug');
app.set('views', './views');

var env = process.env.NODE_ENV || 'development';
if (env == 'development') {
    app.use(errorHandler({ dumpExceptions: true, showStack: true }));
}

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.render('index', { title: 'click link to connect', message: 'Hello there!' });
});

app.get('/auth', function(req, res) {
    // we don't have a code yet
    // so we'll redirect to the oauth dialog
    if (!req.query.code) {
        console.log('Performing oauth for some user right now.');

        var authUrl = fbGraph.getOauthUrl({
            'client_id': conf.client_id,
            'redirect_uri': conf.redirect_uri,
            'scope': conf.scope
        });

        if (!req.query.error) { // checks whether a user denied the app facebook login/permissions
            res.redirect(authUrl);
        } else {  // req.query.error == 'access_denied'
            res.send('access denied');
        }
    } else {
        console.log('Oauth successful, the code (whatever it is) is: ', req.query.code);
        // code is set
        // we'll send that and get the access token
        fbGraph.authorize({
            'client_id': conf.client_id,
            'redirect_uri': conf.redirect_uri,
            'client_secret': conf.client_secret,
            'code': req.query.code
        }, function (err, facebookRes) {
            res.redirect('/UserHasLoggedIn');
        });
    }
});

// user gets sent here after being authorized
app.get('/UserHasLoggedIn', function(req, res) {
    res.render('index', {
        title: 'Logged In'
    });
});

app.use('/api', graphAPIHit);

app.listen(3000, function() {
    console.log('Facebook Graph API POC listening on port 3000');
});
