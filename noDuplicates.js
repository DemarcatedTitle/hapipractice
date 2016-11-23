'use strict';
const mongojs = require('mongojs');
const db = mongojs('hapipractice', ['newUsers', 'users']);
const bcrypt = require('bcrypt');
const bluebirdPromise = require('bluebird');

//The purpose of this file is similar to the previous one off scripts. 
//Build something to learn and tweak into what will go in my actual project. 
//
//So with this I will create something that checks to see if it's a duplicate
//username, and then for the script it will just clean up the dbs, but for 
//the project itself it will just move on to saving it. 


var userList;
function isDupe (user) {
    let nameCount = [];
    let users;
    users.forEach(function(element, index, array){
        if (user.username === element.username){
            nameCount.push(element);
        
        }
    
    });
    // if () {
    
    // }


}

console.log('noduplicates started');
db.users.find(function(error, users){
    let userList = users;
    console.log('find started');
    userList.forEach(function(user, index, array) {
        db.newUsers.find({username: user.username}, function (err, results) {
            if (results.length > 1) {
                
            
            } else {
                // console.log('no duplicate found for ' + user.username);
            
            }
        
        });

    
    });
    // userList.forEach

});
