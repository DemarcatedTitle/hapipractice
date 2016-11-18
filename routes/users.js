'use strict';

const Boom = require('boom');
const uuid = require('node-uuid');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const bluebirdPromise = require('bluebird');

exports.register = function (server, options, next) {
    const db = server.app.db;
    const saveUserInfo = new bluebirdPromise(function(resolve, reject) {


        });

    function fixPass (password) {
        let fix = bcrypt.hashSync(password, 10);
        return fix;
    }

    function closure (test) {
        var user = test;
        console.log('closure user \n');
    function saveTonewUsers(user) {
        return new bluebirdPromise(function (resolve, reject) {
        user.password = fixPass(user.password);
        console.log('This should be second');
            db.newUsers.save(user, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });}

    function backupToUsers(user) {
        return new bluebirdPromise(function(resolve, reject) {
            db.users.save(user, (err, result) => {
                console.log('backuptousers should be first');
                console.log(user.password);
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
    function findUsers(user) {
        return new bluebirdPromise(function (resolve, reject) {
            db.users.find(function(err, result) {
                console.log('this should come first');
                console.log('result.password');
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    
    }

            backupToUsers(user).then(function(){
                user.password = fixPass(user.password);
                console.log('This should be second');
                console.log(user.password);
                db.newUsers.save(user, (err, result) => {
                });
            }, (err) => {
                console.log(err);}).then(function(){
                db.newUsers.find((err, docs)=> {
                console.log('this should be last');
                });
            });
    }
    //Todo:
    //Use a function to encrypt and store the password hash
    //A separate function to save the plaintext passwords, solely for recordkeeping purposes
    //of this learning project. Something easy to remove. 
    //
    //Okay so I got it working and in order, but now I need to solidify my understanding of it. 
    server.route({
        method : "POST",
        path: '/registration',
        handler: function (request, reply) {
            //problem with backup right now is that the encryption is encrypting
            //the backup as well, this should be a basic js thing that is escaping
            //my mind but I am short on time. 
            var test = request.payload;
            test.userid = uuid.v1();
                // db.newUsers.find((err, docs)=> {
                // console.log('this should be last');
                // })
                // findUsers().then(function(){console.log('this should be last');});

            closure(test);
                reply(test);
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
