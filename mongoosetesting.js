//How the file will be organized: 
//Assorted stuff
//Forum stuff
//...
//post stuff
//sample data/functions
const chalk = require('chalk');
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');
var db = mongoose.connection;
var Schema = mongoose.Schema;
var userSchema = new Schema({
    username: String,
    encryptedPass: String,
    unencryptedPass: String,
    privilege: String
});
function standardCallback (err) {
    if (err) {return handleError(err);}
}
//I want admins to be able to:
//Delete/edit posts
//create/delete forums, forum groups, threads
//ban/suspend users. 
//apply special statuses? Maybe like a flair type of thing
//see user history
//

//So basically you click a link at any level and it's iterating through
//things based on the link's parameters. 
//So /forums/ will show you the forum groups
// /forums/news will show you the news forum
// /forums/news/trumpsaidsomething will show you a thread called trumpsaidsomething. 
// each segment is something referencing something in the database
var forumGroupSchema = new Schema({
    topic: String,
    forums: [{forumName:String, forumDescription: String}]
});
var forumGroup = mongoose.model('forumGroup', forumGroupSchema);
var threadListItemSchema = new Schema({
    threadTitle: String,
    threadAuthor: String,
    threadTime: Date,
    replyCount: Number,
    lastPost: Date,
    // forum: String
});
var threadListItem = mongoose.model('threadListItem', threadListItemSchema);
var forumSchema = new Schema({
    forumName: String,
    threadList: [threadListItemSchema]
});
var forum = mongoose.model('forum', forumSchema);
var postSchema = new Schema({
    Time: Date,
    Content: String,
    Author: String
});
var threadSchema = new Schema({
    title: String,
    forumName: String,
    posts: [postSchema]
});
var thread = mongoose.model('thread', threadSchema);
var post = mongoose.model('post', postSchema);
//Right now I think it'll be easier to see what I need to work on
//if I start plugging some of this stuff in to the front end
//So I can see what works easy and what doesn't before I make major
//additions to functionality on the backend
//
function lookupForum(forumToFind){
    //***********************
    //
    //I'm thinking lookups should update the time stamp stuff in the thread list. 
    //Or alternatively the lookup grabs simply grabs the relevant information,
    // might allow me to have less fields. Using getTimeStamp from the id
    // might also help and have less fields
    // 
    //
    // A problem I'm running into is whether not I choose to not repeat data
    // that is already there (the date is in bsonid), but if I completely eliminate
    // that aspect, i think it means 2 queries
    //
    // But onto that also begs the question, should I have not separated the two document types? 
    //
    // lookinto :referencing other documents
    // populating
    // aggregation
    //
    //**********************
    forum.findOne({'forumName': forumToFind}, function(err, foundForum){
        if (err) {
            console.log(err);
            return handleError(err);
        }
        if (foundForum===null){
            console.log('That is not a forum.');
            return;
        } else {
            
            var threadlistitemShouldLookLike = {
                threadTitle: String,
                threadAuthor: String,
                threadTime: Date, //bsonid.gettimestamp of this item 
                replyCount: Number,
                lastPost: Date,//bsonid.gettimestamp of the last item in the array
            };
            
            var whatisthis = foundForum.threadList[0]._id.getTimestamp();
            console.log(chalk.yellow(foundForum));
        }
    });
}
function lookupThread(threadToFind){
    thread.find({}, function(err, foundThread){
    
            console.log(chalk.yellow(foundThread));
    });
}
//
//{{{
var currentThread = new thread({
    title: 'This is for a query test',
    forumName: 'News',
    posts: [{Time: new Date(), Content: 'testing queries', Author: 'mongoMan'}]
    //Date.prototype.toLocaleString() when I display the date
});

//I think this one is working adequately. 
function newThread (threadToCreate) {//{{{
    //threadToCreate is supposed to be a thread model object. 
    //this queries to see if it's a duplicate thread, from here if it's not duplicate
    forum.findOne({'forumName':'News'},function(err, foundForum){
        if (foundForum===null){
            console.log('That is not a forum.');
            return;
        }
        if (err) {
            console.log(err);
            return handleError(err);}
        if (foundForum.threadList.find(function(element, index, array){
            if (element.threadTitle===threadToCreate.threadTitle){
                return true;
            }})) {
            console.log('Duplicate thread');
        } else {
            console.log('not duplicate');
            //this means it's empty, so push/add to both collections
            newThreadListItem = new threadListItem ({
                threadTitle: threadToCreate.title,
                threadAuthor: threadToCreate.posts[0].Author,
                threadTime: threadToCreate.posts[0].Time,
                replyCount: 0,
                lastPost: threadToCreate.posts[0].Time
            });
            console.log(chalk.blue.bgRed.bold(newThreadListItem));
            forum.findOneAndUpdate({forumName:threadToCreate.forumName}, {
                $push : {threadList: newThreadListItem}}, function (err) {
                    if (err) {return handleError(err);}
                });
            threadToCreate.save(function(err){
                if (err) {return handleError(err);}
            });
        }
    });
}//}}}
var curPost=new post({Time: new Date(), Content: 'This is the 2nd post', Author: 'UserZero'});
function newPost (postToMake){
    //this is just to post inside a thread, not a new thread itself. 
    //Doesn't create a new thread list item, but updates an old one
    //does create a new post item in the thread schema
    //{Time: new Date(), Content: 'This is the second post', Author: 'UserZero'}
    thread.findOneAndUpdate({title: currentThread.title, forumName: "News"}, {$push : {posts:postToMake}}, function (err) {});
    thread.findOne({title: "Hello forum", forumName: "News"},function(err, answer){
        console.log(answer);
    });
}
//***************************
//
//This is where I will call functions and comment them out
//as necessary to determine things as I go. 
////}}}
//***************************
// newThread(currentThread);
// lookupForum('News');//Yellow Console Logs
lookupThread();
// newPost(curPost);

////{{{
//
//
//******* ****** thing I'm working on now: need to add to thread list and the threads collection
//threadTitle:
//Hello, forumName this is the first thread.
function seedThreads () {
    //push the thread info to the thread list
    //push the thread content to the threads collection
    //Perhaps at some point have a thing that keeps both in sync
    // forum.find({}, function (err, forums){
    //     console.log(forums);
    // });
}
// seedThreads();
//post title by author at time x replies last post at time
    //Thread title, forum, forum group
    //post author, post date, 
    //I guess default display will just be in chronological order, 
    //but perhaps I'll try to keep it flexible so it can be sorted by other
    //things like votes or something later. 

var user = mongoose.model('user', userSchema);
var newUser = new user({
    username: 'firstUser',
    encryptedPass: 'encryptedPassword',
    unencryptedPass: 'unencryptedPassword',
    privilege: 'admin'
});
//db.on('error', console.error.bind(console, 'connection error:'));
//db.once('open', function() {
//    //were connected

//    console.log('we\'re connected');
//});
//}}}
