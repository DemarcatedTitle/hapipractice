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
const uuid = require('node-uuid');
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

//***********
// Like before, from this point on, all new instances + even the throwAwayInstance suddenly support promises

//boom, hapi, joi, mongojs, node-uuid

const _ = require('lodash');

//Taking a moment to bring the information to the front of my mind
//and type this up so I understand what's going on
//
//Inert is allowing me to feed my css file to the browser
//
//Vision is allowing me to use handlebars and feed my views to the browser

server.connection({
    host: 'localhost',
    port: Number(process.argv[2] || 8080)
});

server.register(Inert, function (err) {
    if (err) throw err;
});


server.register(Vision, function (err) {
    if (err) throw err;
});

server.app.db = mongojs('hapipractice', ['posts']);
server.app.db = mongojs('hapipractice', ['users']);
server.app.db = mongojs('hapipractice', ['newUsers']);

const db = server.app.db;
server.register([
    require('./routes/users'),
    require('./routes/forum')

    ], (err) => {

    if (err) {
        throw err;
    }

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
  handler: {
    directory: {
      path:   path.join(__dirname, 'templates'), 
      listing: false,
      index:   false
    }
  }
});


