module.exports = function (context) {
    //Intentions for this helper:
    //get the username and return a class="privilege" for it. 
    
    // var indexNum = context.data.index;
    // var username = context.data.root[indexNum].username;
    // var privilege = context.data.root[username].privilege;

    const posts = context.data.root;
    const indexNum = context.data.index;
    const privilege = posts[indexNum].privilege;
    const username = posts[indexNum].username;
    console.log(privilege + ' ' + username);


    
    
    // if (privilege !== undefined) {

    //     // console.log(privilege);
    //     return "<div class='" + privilege + " row'>";
    // } else {
    //     return "<div class='guest row'>";
    // }
    //
    // I think to properly modify it, instead of checking the whole users 
    // database and setting that as the context, it would be better to
    // individually look up the users and set that as part of the context. 
    //
    // So it would look like posts = db.posts.find() 
    // for each post: get each username/id
    // 
    //
    //maybe posts should just have that data ready
    // console.log(context.data.root[context.data.index]);
    // console.log(context.data.root);



};
