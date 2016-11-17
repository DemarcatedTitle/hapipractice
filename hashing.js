'use strict';
const mongojs = require('mongojs');
const db = mongojs('hapipractice', ['newUsers']);

const bcrypt = require('bcrypt');
const bluebirdPromise = require('bluebird');
bluebirdPromise.promisifyAll(require('mongojs'));
bluebirdPromise.promisifyAll(db);

var oldPasswords;

function fixPass (username, password) {
    let fix = bcrypt.hashSync(password, 10);
    return fix;
    
}

function savePasswords (correctedUser) {
    var bulk = db.newUsers.initializeOrderedBulkOp();
    bulk.find({username: correctedUser.username})
    .update({$set: {"password": correctedUser.password}});
    bulk.execute(function (err, res) {
        console.log(correctedUser.username + '\'s password saved!');
    });
}

function selectUsers(){ 
    var users;
    return new bluebirdPromise(function (resolve, reject) { 

    db.newUsers.find(function (err, docs) {
        users=docs;
        if (err) reject();
        else resolve();
        });})
        .then(() => {
            users.forEach(function (element, array, index) {

                element.password = fixPass(element.username, element.password);
                console.log(element.username + '\n' + element.password + '\n' );
            });

        }, (err) => {
            console.log(err);})
            .then(() => {
                users.forEach(function(element, array, index) {
                    savePasswords(element);

                
                });
        
        }, (err) =>{
            console.log(err);
        });
}

selectUsers();
//The purpose of this script is to practice using bcrypt and update the old passwords
//to hashes, the bcrypt version of my fix.js file. 
//
//I have also decided to use bluebird promises just to learn it a bit
//


// var hash = bcrypt.hashSync('myPlaintextPassword', 10);
// console.log(hash);

// console.log(bcrypt.compareSync('myPlaintextPassword', "$2a$10$xRd8Sz3NeHsD7eaa.5QuFe0S0VME2vFBTfdds1xwLAl9obDY6MA4m"));
