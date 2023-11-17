var mysql = require('mysql');

// Let’s connect our project to this database.
var connection = mysql.createConnection({
    host:       'localhost',    //  unt-examples.csheaaeddgfs.us-east-2.rds.amazonaws.com',       //  localhost',
    user:       'root',         //  'masterUsername',                   //  root localhost user name
    password:   '!Anguilla76',  //  commented out localhost password is empty
    database:   'wardClerk'      //  'UNT_Examples'                      //  local host database 'examples'
});

//      the connection just connects and we are done.
//      The connection variable will be exported and available in the routers
connection.connect(function(error){
    if(!!error) {
        console.log(error);
    } else {
        console.log('Connected..!');
    }
});
//  the connection is made available to the rest of the world
module.exports = connection;