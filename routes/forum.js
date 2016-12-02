'use strict';
const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');
exports.register = function (server, options, next) {
    const db = server.app.db;

var cookie_options = {
    ttl: 60*60*1000,
    encoding: 'none',
    isSecure: false,
    isHttpOnly: true,
    clearInvalid: true,
    strictHeader: true,
    path : '/',
    // domain: 'localhost:8080' //Must be ommitted entirely? 
};
    server.route({
        method: 'POST',
        path: '/',
        handler: function (request, reply) {
            const message = request.payload;
            //Create an id
            message._id = uuid.v1();
            db.posts.save(message, (err, result) => {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                // reply(message);
                // reply.view('youposted.html');
            });
            db.posts.find((err, docs) => {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                reply(docs);
            });
        },
        config: {
            validate: {
                payload: {
                    username: Joi.string().min(1).max(50),
                    userpost: Joi.string().min(1).max(50)
                    // privilege: Joi.string().min(1).max(10)
                }
            }
        }
    });
    server.route({
        method: ['GET','POST'],
        path: '/index',
        handler: function (request, reply) {
            //Create an id
            
            console.log('/index');
            reply.view('index.html')
            .header("Authorization", request.headers.authorization)
            .state("token", request.headers.authorization, cookie_options);
        },
        config: {
            auth: false
            // validate: {
            //     payload: {
            //         username: Joi.string().min(1).max(50),
            //         password: Joi.string().min(1).max(50)
            //         // privilege: Joi.string().min(1).max(10)
            //     }
            // },
        }
    });

    return next();
};

exports.register.attributes = {
    name: 'forum'

};
