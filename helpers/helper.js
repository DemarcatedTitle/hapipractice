module.exports = function(context) {

    var populate = '<div>';

    populate = populate + context.root;
    populate = populate + '</div>';

    return populate;

};
//The way to send data to a helper and through to an html page is by 
//sending it through the context, which in hapi would mean doing a:
//reply.view('something.html', {some: 'kind of object/variable'})
