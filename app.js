"use strict";

/* Module dependencies:
 *
 * require() loads a nodejs "module" - basically a file.  Anything
 * exported from that file (with "exports") can now be dotted off
 * the value returned by require(), in this case e.g. splat.api
 */
var http = require("http"),
    express = require("express"),
    fs = require("fs"),
    path = require("path"),
    url = require("url"),
    multer = require("multer"),
    logger = require("morgan"),
    compression = require("compression"),
    session = require("express-session"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    directory = require("serve-index"),
    errorHandler = require("errorhandler"),
    basicAuth = require("basic-auth-connect"),  // add for HTTP auth

    // config is an object module, that defines app-config attribues,
    // such as "port"
    config = require("./config"),
    splat = require('./routes/splat.js');  // route handlers

// middleware check that req is associated with an authenticated session
function isAuthd(req, res, next) {
    // A3 ADD CODE BLOCK
        return next();
};

// middleware check that the session-userid matches the userid passed
// in the request body, e.g. when deleting or updating a model
function hasPermission(req, res, next) {
    // A3 ADD CODE BLOCK
        return next();
};

// Create Express app-server
var app = express();   

// use PORT enviro variable, or local config-file value
app.set('port', process.env.PORT || config.port);

// activate basic HTTP authentication (to protect your solution files)
app.use(basicAuth(config.basicAuthUser, config.basicAuthPass));  

// change param to control level of logging
app.use(logger(config.env));  /* 'default', 'short', 'tiny', 'dev' */

// use compression (gzip) to reduce size of HTTP responses
app.use(compression());

app.use(bodyParser.json({limit: '5mb'}));
app.use(bodyParser.urlencoded({
	extended: true, limit: '5mb'
}));

app.use(multer({dest: __dirname + '/public/img/uploads/'}));

// Session config, based on Express.session, values taken from config.js
app.use(session({
	name: 'splat.sess',
	secret: config.sessionSecret,  // A3 ADD CODE
	rolling: true,  // reset session timer on every client access
	cookie: { maxAge:config.sessionTimeout,  // A3 ADD CODE
		  // maxAge: null,  // no-expire session-cookies for testing
		  httpOnly: true },
	saveUninitialized: false,
	resave: false
}));

// checks req.body for HTTP method overrides
app.use(methodOverride());


// App routes (API) - implementation resides in routes/splat.js

// Heartbeat test of server API
app.get('/', splat.api);

// Retrieve a single movie by its id attribute
app.get('/movies/:id', splat.getMovie);

// Retrieve a collection of all movies
app.get('/movies', splat.getMovies);

// Create a new movie in the collection
app.post('/movies', isAuthd, splat.addMovie);

// Update an existing movie in the collection
app.put('/movies/:id', [isAuthd, hasPermission], splat.editMovie);

// Update review score for existing movie in the collection - not auth'd
app.patch('/movies/:id', splat.reviewMovie);

// Delete a movie from the collection
app.delete('/movies/:id', [isAuthd, hasPermission], splat.deleteMovie);

// Retrieve a collection of reviews for movie with given id
app.get('/movies/:id/reviews', splat.getReviews);

// Create a new review in the collection
app.post('/movies/:id/reviews', isAuthd, splat.addReview);

// Video playback request
app.get('/movies/:id/video', splat.playMovie);

// User login/logout
app.put('/user', splat.auth);

// User signup
app.post('/user', splat.signup);

// location of static content
app.use(express.static(__dirname +  "/public"));

// allow browsing of docs directory
app.use(directory(__dirname +  "/public/docs"));

// display errors in browser during development
app.use(errorHandler({ dumpExceptions:true, showStack:true }));

// Default-route middleware in case none of above match
app.use(function (req, res) {
    res.status(404).send('<h3>File Not Found</h3>');
});

// Start HTTP server
http.createServer(app).listen(app.get('port'), function (){
  console.log("Express server listening on port %d in %s mode",
                app.get('port'), config.env );
});
