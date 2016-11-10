'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');

exports.register = function (server, options, next) {
    const db = server.app.db;

    server.route({
        method : "POST",
        path: '/registration',
        handler: function (request, reply) {

            console.log(request.payload);
            const user = request.payload;
            user.userid = uuid.v1();
            db.users.save(user, (err, result) => {
                if (err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                console.log(user);

                reply(user);
            });
        },
        config: {
            validate: {
                payload: {
                    username: Joi.string().min(2).max(20).required(),
                    password: Joi.string().min(2).max(20).required(),
                    privilege: Joi.string().min(2).max(20).required()
                }
            }
        }


    });


    return next();
};

exports.register.attributes = {
    name: 'routes-users'

};
