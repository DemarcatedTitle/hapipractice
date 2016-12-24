'use strict';
const HapiAuthJwt = require('hapi-auth-jwt2');
var mongojs = require("mongojs");
const db = mongojs('hapipractice', ['newUsers']);
//the callback in validate was the missing piece. 
// var cookie_options = {
//     ttl: 60*60*1000,
//     encoding: 'none',
//     isSecure: false,
//     isHttpOnly: true,
//     clearInvalid: false,
//     strictHeader: true
// };

function validate (decoded, token, cb) {
    // console.log('auth.js validate fun attempted ' + decoded);
    db.newUsers.findOne({userid: decoded.userid}, function (err, result) {
        return cb(null, true);
    });
}
exports.register = function (plugin, options, next) {
    plugin.register(HapiAuthJwt, function(err) {
        if (err) {
            console.log('hapiauthjwt err');
            return next(err);
        }

        plugin.auth.strategy('jwt', 'jwt', {
            key: 'tempkey',
            validateFunc: validate,
            verifyOptions: { ignoreExpiration: true },
            errorFunc: function(errorContext) {
                console.log(errorContext);
            
            
            }
        });

        next();
    });
};


exports.register.attributes = {
    name: 'jwt',
    version: '1.0.0'
};

// module.exports = register;
