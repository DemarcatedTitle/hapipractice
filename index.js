
'use strict';
const Hapi = require('hapi');
const server = new Hapi.Server();
const Inert = require('inert');
const path = require('path');
const Vision = require('vision');
const Joi = require('joi');
const fs = require('fs');
const Boom = require('boom');
const bluebirdPromise = require('bluebird');
// const mongojs = bluebirdPromise.promisifyAll(require('mongojs'));
// const uuid = require('node-uuid');
var mongojs = require("mongojs");
bluebirdPromise.promisifyAll([
   require("mongojs/lib/collection"),
   require("mongojs/lib/database"),
   require("mongojs/lib/cursor")
]);
//experimental 
// dev.index.js
require("nodejs-dashboard");
require("./index");



function validate (decoded, token, cb) {
    db.newUsers.findOne({userid: decoded.userid}, function (err, result) {
    });
}

const _ = require('lodash');
const auth = require('./config/auth.js');

// Plugins management
server.connection({
    host: 'localhost',
    port: Number(process.argv[2] || 8080)
});

server.app.db = mongojs('hapipractice', ['posts']);
server.app.db = mongojs('hapipractice', ['users']);
server.app.db = mongojs('hapipractice', ['newUsers']);

const db = server.app.db;
//**********The order of this is important!**********
//VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV
server.register([
    Vision,
    Inert,
    auth,
    require('./routes/users'),
    require('./routes/forum')
    ], (err) => {
    if (err) {
        throw err;
    }
    // server.state('data', {
	// ttl: null,
	// isSecure: false,
	// isHttpOnly: true,
	// encoding: 'none',
	// clearInvalid: false, // remove invalid cookies
	// strictHeader: true ,// don't allow violations of RFC 6265
	// path: '/'
    // });
    server.start(function () {
        console.log('Server running at:', server.info.uri);
    });
});
server.views({
    engines: {
        html: require('handlebars')
    },
    path: path.join(__dirname, 'templates'),
    helpersPath: 'helpers'
        //this sets up the directory to be read from for the views and helpers
});
//This route is serving up static files in the templates folder
//allowing me to send my main.css.
server.route({
  method: 'GET',
  path: '/{param*}',
  config: {auth: false},
  handler: {
    directory: {
      path:   path.join(__dirname, 'templates'), 
      listing: false,
      index:   false
    }
  }
});


