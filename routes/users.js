'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const bluebirdPromise = require('bluebird');
const HapiAuthJwt = require('hapi-auth-jwt2');
const JWT = require('jsonwebtoken'); // used to sign our content
//{{{
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
//why are my cookies working now when they didn't before?
exports.register = function (server, options, next) {
    const db = server.app.db;//{{{//{{{
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
        handler: function (request, reply) {
            //problem with backup right now is that the encryption is encrypting
            //the backup as well, this should be a basic js thing that is escaping
            //my mind but I am short on time. 
            var userInfo = request.payload;
            userInfo.userid = uuid.v1();
            db.newUsers.find({"username": userInfo.username}, function (err, docs) {
                var user = docs;
                if (user.length === 0) {
                    registernewUsers(userInfo);
                    reply('You are registered, Congratulations!');
                } else {
                    user.occupied = 'That username is taken.';
                    reply.view('userregistration.html', user)
                    .header("Authorization", request.headers.authorization)
                    .state("token", request.headers.authorization, cookie_options);
                }
            });
                // db.newUsers.find((err, docs)=> {//{{{
                // console.log('this should be last');
                // })
                // findUsers().then(function(){console.log('this should be last');});
                // db.users.findAsync({"username": "finaltest"}, function(err, docs)  {
                    
                //     console.log(docs);
                // })
                // findUsers().then(function(athing){
                //     console.log('second thing then worked');
                //     console.log(athing);
                // }, function(){console.log('error');}).then(() => {console.log("third thing");});

            // savePasses(test);//}}}
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
    server.route({
            method : "GET",
            path : '/registration',
            handler : function (request, reply) {
		console.log('/registration GET');
                console.log(request.headers.cookie);
                reply.view('userregistration.html')
                .header("Authorization", request.headers.authorization)
                .state("token", request.headers.cookie.token, cookie_options);
            },
            config : {
                auth : 'jwt',
                state: {
                    parse : true,
                    failAction: 'ignore'
                }
            }
    });//}}}

    server.route({
        path: '/', method:'GET',
        handler: function (request, reply) {
            db.posts.find((err, docs) => {
                if(err) {
                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                }
                var posts = docs;
                console.log('Get request');
                console.log(request.headers.Authorization);
                reply.view("youposted.html", posts)
                .header("Authorization", request.headers.authorization)
                .state("token", request.headers.authorization, cookie_options);
            });
        }
    });
    server.route({
        method : "POST",
        path: '/login',
        handler: function (request, reply) {
            console.log('/login handler: login attempt');
            let username = request.payload.username;
            let password = request.payload.password;
            db.newUsers.findOne({username: username}, function(err, user) {
                if (err) {
                    return Boom.internal('Error retrieving user');
                }
                if (user) {
                    bcrypt.compare(password, user.password, function (err, res) {
                        if (err) {
                            return reply(Boom.internal('Bcrypt comparison error.'));
                        }
                        if (res) {
                            var tokenData = {
                                username: username,
                                privilege: user.privilege,
                                id: user.userid
                            };
                            let token = JWT.sign(tokenData, 'tempkey');
                            console.log(token);
                            db.posts.find((err, docs) => {
                                if(err) {
                                    return reply(Boom.wrap(err, 'Internal MongoDB error'));
                                }
                                var posts = docs;
                                console.log('Get request');
                                console.log(request.headers.authorization);
                                reply.view("youposted.html", posts)
                                // .header("Authorization", request.headers.authorization)
                                .state("token", token, cookie_options);
                            });
                            // reply.view('youposted.html')
                            // .header("Authorization", token)
                            // .state("token", token, cookie_options);
                        }
                    });
                    
                    
                }
                if (user===null) {
                    return reply(Boom.unauthorized('Bad login attempt'));
                }
            
            });
        },
        config: {
            validate: {
                payload: {
                    username: Joi.string().min(2).max(20).required(),
                    password: Joi.string().min(2).max(20).required(),
                }
            },
            auth: false
        }
    });//}}}
// server.register(HapiAuthJwt, function (err) {
//     if (err) {
    
//         console.log(err);
//     }
// }
//         );
    server.auth.default('jwt');
    server.route({
        method: 'GET',
        path: '/restricted',
        config: { auth : 'jwt', state: {parse:true, failAction: 'ignore'}},
        handler: function (request, reply) {
            console.log('restricted attempt');
            console.log(request.headers);
            reply.view('youposted.html')
            .header("Authorization", request.headers.authorization)
            .state("token", request.headers.cookie.slice(6), cookie_options);
        }
    });
    return next();
};

exports.register.attributes = {
    name: 'routes-users'

};
