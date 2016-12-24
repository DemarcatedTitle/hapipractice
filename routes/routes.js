'use strict';
const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const bluebirdPromise = require('bluebird');
const HapiAuthJwt = require('hapi-auth-jwt2');
const JWT = require('jsonwebtoken'); // used to sign our content
const controller = require('../controllers/controller.js');
exports.register = function (server, options, next) {
    const db = server.app.db;
    server.auth.default('jwt');
    server.route({
        method: 'POST',
        path: '/',
        config: controller.slashPOST
    });
    server.route({
        method: ['POST'],
        path: '/index',
        config : controller.indexPOST 
    });
    server.route({
        method: ['GET'],
        path: '/index',
        config : controller.indexGET
    });

//{{{
    function fixPass (password) {
        let fix = bcrypt.hashSync(password, 10);
        return fix;
    }
//}}}
    function registernewUsers(userDocs) {
        console.log('registernewUsers');
        db.users.save(userDocs, function (err, docs) {
            console.log(docs);
            userDocs.password = fixPass(userDocs.password);
            console.log('db.users.save activated');
            db.newUsers.save(userDocs, (err, result) => {
                console.log('db.newusers.save activated');
                console.log(result);
            });
        });
    }
    server.route({
        method : "POST",
        path: '/registration',
        config: controller.registrationPOST
    });
    
    server.route({
            method : "GET",
            path : '/registration',
            config : controller.registrationGET 
    });//}}}

    server.route({
        path: '/forums/{forumsThreads*}', method:'GET',
        config : controller.subForums
    });
    server.route({
        path: '/', method:'GET',
        config : controller.forum
    });
    server.route({
        method : "GET",
        path: '/login',
        config: controller.loginGET 
    });//}}}
    server.route({
        method : "POST",
        path: '/login',
        config: controller.loginPOST
    });//}}}
    server.route({
        method: 'GET',
        path: '/restricted',
        config: controller.restrictedGET
    });
    server.route({
    method : "GET",
        path : '/signout',
        handler : function (request, reply) {
            reply.view('index.html').unstate('token');
        },
        config : {
            auth : 'jwt'
        }
    });//}}}
    return next();
};
exports.register.attributes = {
    name: 'routes'
};

