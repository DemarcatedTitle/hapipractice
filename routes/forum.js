'use strict';
const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');
exports.register = function (server, options, next) {
    const db = server.app.db;
    server.route({
        path: '/', method:'GET',
        //?name=Handling 
        handler: function (request, reply) {
            db.posts.find((err, docs) => {
                if(err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                var posts = docs;
                console.log('Get request');
                reply.view("youposted.html", posts);
            });
        }
    });

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

    return next();
};

exports.register.attributes = {
    name: 'forum'

};
