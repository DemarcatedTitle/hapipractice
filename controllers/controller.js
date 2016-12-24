const server = require('../index.js');
var mongojs = require("mongojs");
const db = server.app.db;
const Joi = require('joi');
const bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken'); // used to sign our content
const uuid = require('node-uuid');

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
var cookie_options = {
    ttl: 2*60*60*1000,
    encoding: 'none',
    isSecure: false,
    isHttpOnly: true,
    clearInvalid: true,
    strictHeader: true,
    path : '/',
};
function templateContext (credentials, posts) {
    let context = {};
    context.thisUser = credentials;
    context.posts = posts;
    context.main = true;
    if (posts) {
        context.posts.forEach(function (element, index, array) {
            context.posts[index].userpost = element.userpost.replace("\r\n", "<br>");
        }, this);
    }
    return context;
}
exports.slashPOST = {
    handler: function (request, reply) {
        const message = request.payload;
        message.username = request.auth.credentials.username;
        //Create an id
        message._id = uuid.v1();
        message.privilege = request.auth.credentials.privilege;
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
            let context = {};
            context.thisUser = request.auth.credentials;
            context.posts = docs;
            console.log('Get request');
            context.main=true;
            reply.view("youposted.html", context);
        });
    },
    validate: {
        payload: {
            // username: Joi.string().min(1).max(50),
            userpost: Joi.string().min(1).max(50)
            // privilege: Joi.string().min(1).max(10)
        }
    }
};

exports.registrationPOST = {
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
                    reply.view('userregistration.html', user);
                }
            });
    },
    validate: {
        payload: {
            username: Joi.string().min(2).max(20).required(),
            password: Joi.string().min(2).max(20).required(),
            privilege: Joi.string().min(2).max(20).required()
        }
    }
};
exports.registrationGET = {
    handler : function (request, reply) {
        console.log(request.auth.credentials);
        let context = {};
        context.thisUser = request.auth.credentials;
        context.registration = true;
        reply.view('userregistration.html', context);
    },
    auth : 'jwt'
};

exports.indexPOST = {
        handler: function (request, reply) {
            //Create an id
            // let cookie; 
            // if (request.headers.cookie) {
            //     cookie = request.headers.cookie.slice(6);
            // }
            console.log('/index');
            let context = {main : true};
            reply.view('index.html', context);
        },
    auth: {mode: 'optional'},
        validate: {
            payload: {
                username: Joi.string().min(1).max(50),
                password: Joi.string().min(1).max(50)
            }
        }
};
exports.indexGET = {
handler: function (request, reply) {
        console.log('/index');
        let context = {main : true};
        reply.view('index.html', context);
    },
    auth: {mode: 'optional'},
};


server.app.db = mongojs('hapipractice', ['forum']);
exports.subForums = {
    handler: function (request, reply) {
        db.forum.find({ForumName:"General Forum"},(err, docs) => {
            if(err) {
                return reply(Boom.wrap(err, 'Internal MongoDB error'));
            }
            console.log(docs[0].ForumName);
            let context = templateContext(request.auth.credentials, docs[0].testfield);
            // reply.view("youposted.html", context);
            reply('subforum: ' + request.params.forumsThreads);
        });
        // reply.view("youposted.html", templateContext(request.auth.credentials));
    },
    auth: {mode : 'optional'}

};
exports.forum = {
    handler: function (request, reply) {
        db.posts.find((err, docs) => {
            if(err) {
                return reply(Boom.wrap(err, 'Internal MongoDB error'));
            }
            reply.view("youposted.html", templateContext(request.auth.credentials, docs));
        });
    },
    auth: {mode : 'optional'}
};

exports.loginGET = {
handler: function (request, reply) {
            //Create an id
            let cookie; 
            if (request.headers.cookie) {
            cookie = request.headers.cookie.slice(6);
            }
            let context = {};
            context.thisUser = request.auth.credentials;
            console.log(context.thisUser);
            context.login = true;
            reply.view('index.html', context);
        },
    auth: {mode : 'optional'} 
};


exports.loginPOST = {
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
                                console.log('Get request');
                                console.log(request.headers.authorization);
                                let context = {};
                                context.thisUser = tokenData;
                                // context.main = true;
                                context.posts = docs;
                                context.main = true;
                                console.log(context);
                                reply.view("youposted.html", context)
                                // .header("Authorization", request.headers.authorization)
                                .state("token", token, cookie_options);
                            });
                            // reply.view('youposted.html')
                        }
                    });
                }
                if (user===null) {
                    return reply(Boom.unauthorized('Bad login attempt'));
                }
            });
        },
        validate: {
                payload: {
                    username: Joi.string().min(2).max(20).required(),
                    password: Joi.string().min(2).max(20).required(),
                }
            },
            auth: false

};
exports.restrictedGET = {
    handler: function (request, reply) {
        console.log('restricted attempt');
        let context = {};
        context.thisUser = request.auth.credentials;
        console.log(context.thisUser);
        context.restricted = true;
        reply.view('youposted.html', context);
    },
    auth : 'jwt', state: {parse:true, failAction: 'ignore'}
};
