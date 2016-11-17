'use strict';
const mongojs = require('mongojs');
// const Hapi = require('hapi');
// const server = new Hapi.Server();
//I'm thinking I want to iterate through each post, and then when the username matches, update it 
//

const db = mongojs('hapipractice', ['posts', 'users']);




function getPosts () {
db.posts.find(seekUserPrivilege);
}

function seekUserPrivilege (err, docs) {
    if (err) {
        return console.log(err);
    }
    ////I guess this is the iterator I should use to find their privilege level//{{{
    ////What I'm trying to do is find an individual doc
    ////
    ////I had some difficulty trying to figure out why it would just 
    ////return undefined, it would seem the asynchronous nature
    ////of node was to blame. I had a db.close() at the end of this script
    ////and after reading that it's not recommended to do that anywhere
    ////in node, I deleted it and now it works perfectly. //}}}
    docs.forEach(function(element, index, array) {
        let name = element.username;
        db.users.findOne({ "username": name }, updatePrivilege);
    });
}

function updatePrivilege (err, user) {
    //Mongojs uses 2.6, not the latest version of mongodb commands
    //
    //Create bulk variable, assign the operations to it, 
    var bulk = db.posts.initializeOrderedBulkOp();
    console.log(user.privilege);
    bulk.find({username: user.username})
    .update({$set: {"privilege": user.privilege, userid: user.userid}});

    showResult();
    //And then execute those operations
    bulk.execute(function (err, res) {
        console.log('Done!');
    });
}
function showResult () {
    db.posts.find();
}
getPosts();

//The script was a success, it updated all the posts with both userid and privilege. 
//The thing I'm still a little uncertain about is how to keep node from just hanging. 
//The script accomplishes what it should, but because of the mongodb/js connection
//it doesn't close automatically. db.close() did that but messes with it because 
//asynchronous nature. 


