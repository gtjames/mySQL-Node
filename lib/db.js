var mysql = require('mysql');

// Let’s connect our project to this database.
var connection = mysql.createConnection({
    host:       'localhost',    //  unt-examples.csheaaeddgfs.us-east-2.rds.amazonaws.com',       //  localhost',
    user:       'root',         //  'masterUsername',                   //  root localhost user name
    password:   '!Anguilla76',  //  commented out localhost password is empty
    database:   'examples'      //  'UNT_Examples'                      //  local host database 'examples'
});

//      When the connection fails this might be necessary
// ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '!Anguilla76';
// flush privileges;

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