var mysql = require('mysql');

// Let’s connect our project to this database.
var connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    // password:'password',                 //  I have not created a password for my root user. So sue me!
    database:'examples'
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