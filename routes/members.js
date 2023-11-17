var express = require('express');
var router = express.Router();
var dbConn = require('../lib/db');         //  yes, this is our connection variable from the db.js file

//  display members page when the url is "members/"
//  remember back in app.js we defined all /members requests would come here
//  so in this code we only reference the rest of the URL
router.get('/', (req, res, next) => {
    //  We are just using plain old SQL to hit the database.
    //                                                  OH LOOK! a callback function
    dbConn.query('SELECT * FROM wardList ORDER BY last, first', (err, rows) => {
        if (err) {
            req.flash('error', err);
            // render to views/members/index.ejs
            res.render('members', { data: '' });          //  notice all data back to the client is in a JSON object
        } else {
            // render to views/members/index.ejs
            res.render('members', { data: rows });        //  JSON data of the list of members
        }
    });
});

router.get('/get/(:id)', (req, res, next) => {
    dbConn.query('SELECT * FROM wardList ORDER BY last, first', (err, rows) => {
        if (err) {
            res.send({ data: err });          //  notice all data back to the client is in a JSON object
        } else {
            res.send({ data: rows });        //  JSON data of the list of members
        }
    });
});

// display add member page
//      URL:            /members/add
router.get('/add', function (req, res, next) {
    // render to add.ejs
    res.render('members/add', {  //  no data because we are adding a new member
        id: 0, first: '', last: '', address1: '', notes: '', city: '', gender: '', 
        address2: '', zip: '', age: 0, birthday: '', minBros: '', 
        homePhone: '', email: '', phone: '', institute: '', convert: '', endowed: '', RM: '', 
        movedIn: '', priesthood: '', recExpire: '', recStatus: '', recType: '', 
        minSiss: '', lat: '', long: ''
    });
})

// add a new member
//      this is a POST request. We are receiving data back from the client
router.post('/add', function (req, res, next) {
    if (req.body.first.length === 0 || req.body.last.length === 0) {      //  not so fast. If you didn't enter anything we are not going to add that
        // set flash message
        req.flash('error', "Please enter First and Last Name");
        // render to add.ejs with flash message
        res.render('members/add', req.body );
    } else {                  // if no error
        // insert query
        //      calling the database                        and waiting for the callback results over here
        req.body.name = `${req.body.last}, ${req.body.first}`;
        dbConn.query('INSERT INTO wardList SET ?', req.body, (err, result) => {
            if (err) {
                req.flash('error', err)
                res.render('members/add', req.body);        // render to add.ejs
            } else {
                req.flash('success', 'Member successfully added');
                res.redirect('/members');
            }
        })
    }
})

// display edit member page
router.get('/edit/(:id)', function (req, res, next) {
    dbConn.query(`SELECT * FROM wardList WHERE id = ${req.params.id}`, (err, rows, fields) => {
        if (err) throw err

        // if user not found
        if (rows.length <= 0) {
            req.flash('error', `Member not found with id = ${req.params.id}`)
            res.redirect('/members')
        }
        // if member found
        else {
            // render to edit.ejs
            res.render('members/edit', rows[0]);
        }
    })
})

// update member data
router.post('/update/:id', (req, res, next) => {
    req.body.id = req.params.id;

    if (req.body.first.length === 0 || req.body.last.length === 0) {
        req.flash('error', "Please enter First and Last Name"); // set flash message
        res.render('members/edit', req.body );  // render to add.ejs with flash message
    } else {            // if no error
        // update query
        dbConn.query('UPDATE wardList SET ? WHERE id = ' + req.params.id, req.body, (err, result) => {
            if (err) {
                req.flash('error', err);            // set flash message
                res.render('members/edit', req.body );  // render to edit.ejs
            } else {
                req.flash('success', 'Member successfully updated');
                res.redirect('/members');
            }
        })
    }
})

// delete member
router.get('/delete/(:id)', (req, res, next) => {
    dbConn.query(`DELETE FROM wardList WHERE id = ${req.params.id}`, (err, result) => {
        if (err) {
            req.flash('error', `${err.sqlMessage} -- ${err.sql}`);      // set flash message
        } else {
            req.flash('success', `Member successfully deleted! ID = ${req.params.id}`) // set flash message
        }
        res.redirect('/members')        // redirect to members page
    })
})

// search wardList
router.post('/search', function (req, res, next) {
    dbConn.query(
        `SELECT * FROM wardList WHERE ${req.body.attrib} like '%${req.body.search}%'`, (err, rows) => {
            if (err) {
                req.flash('error', err);
                res.render('members', { data: '' });
            } else {
                res.render('members', { data: rows });      //  JSON data of the list of members
            }
        });
})

module.exports = router;