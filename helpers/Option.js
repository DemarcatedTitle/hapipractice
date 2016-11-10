module.exports = function(context) {
    var indexNum = context.data.index;
    var username = context.data.root.posts[indexNum].username;
    var privilege = context.data.root.users[username].privilege;


    // if (privilege === "user") {
    //     return "<p class='col-md-1 username'>User</p>";

    // }
    // if (privilege === "admin") {
    //     return "<p class='col-md-1 username'>Admin</p>";
    // }
    // else {
    //     return "<p class='col-md-1 username'>Guest</p>";

    // }
    // Old Thing
    
    //Name = remove value = index 
    
    return "<form action ='' class='col-md-1' method='POST'><button class='.btn-sm' formmethod='POST' name='remove' value='" + indexNum + "'>Remove</button></form>";
    
    

};

//Button with a value that makes the appropriate POST which says which thing to delete/remove from the
//posts array
//
//A future/more useful addition would be some kind of authentication thing
