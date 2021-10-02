var express = require('express');
var router = express.Router();
var dbConn  = require('../lib/db');         //  yes, this is our connection variable from the db.js file

//  display books page when the url is "books/"
//  remember back in app.js we defined all /books requests would come here
//  so in this code we only reference the rest of the URL
router.get('/', function(req, res, next) {

    //  We are just using plain old SQL to hit the database.
    //                                                  OH LOOK! a callback function
    dbConn.query('SELECT * FROM books ORDER BY id desc',function(err,rows)     {

        if(err) {
            req.flash('error', err);
            // render to views/books/index.ejs
            res.render('books',{data:''});          //  notice all data back to the client is in a JSON object
        } else {
            // render to views/books/index.ejs
            res.render('books',{data:rows});        //  JSON data of the list of books
        }
    });
});

// display add book page
//      URL:            /books/add
router.get('/add', function(req, res, next) {
    // render to add.ejs
    res.render('books/add', {
        name: '',                   //  no data because we are adding a new book
        author: ''
    })
})

// add a new book
//      this is a POST request. We are receiving data back from the client
router.post('/add', function(req, res, next) {

    let name = req.body.name;           //  the body object from the client contains our data
    let author = req.body.author;

    if(name.length === 0 || author.length === 0) {      //  not so fast. If you didn't enter anything we are not going to add that
        // set flash message
        req.flash('error', "Please enter name and author");
        // render to add.ejs with flash message
        res.render('books/add', {
            name: name,     //  notice we return the data we did get. So if one of these is filled in
            author: author  //  then it will get displayed back on the page
        })
    }   else {                  // if no error
        var form_data = {
            name: name,
            author: author
        }

        // insert query
        //      calling the database                        and waiting for the callback results over here
        dbConn.query('INSERT INTO books SET ?', form_data, function(err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)

                // render to add.ejs
                res.render('books/add', {
                    name: form_data.name,
                    author: form_data.author
                })
            } else {
                req.flash('success', 'Book successfully added');
                res.redirect('/books');
            }
        })
    }
})

// display edit book page
router.get('/edit/(:id)', function(req, res, next) {

    let id = req.params.id;

    dbConn.query('SELECT * FROM books WHERE id = ' + id, function(err, rows, fields) {
        if(err) throw err

        // if user not found
        if (rows.length <= 0) {
            req.flash('error', 'Book not found with id = ' + id)
            res.redirect('/books')
        }
        // if book found
        else {
            // render to edit.ejs
            res.render('books/edit', {
                title: 'Edit Book',
                id: rows[0].id,
                name: rows[0].name,
                author: rows[0].author
            })
        }
    })
})

// update book data
router.post('/update/:id', function(req, res, next) {

    let id = req.params.id;
    let name = req.body.name;
    let author = req.body.author;

    if(name.length === 0 || author.length === 0) {
        // set flash message
        req.flash('error', "Please enter name and author");
        // render to add.ejs with flash message
        res.render('books/edit', {
            id: req.params.id,
            name: name,
            author: author
        })
    } else {            // if no error
        var form_data = { name: name, author: author };

        // update query
        dbConn.query('UPDATE books SET ? WHERE id = ' + id, form_data, function(err, result) {
            //if(err) throw err
            if (err) {
                // set flash message
                req.flash('error', err)
                // render to edit.ejs
                res.render('books/edit', {
                    id: req.params.id,
                    name: form_data.name,
                    author: form_data.author
                })
            } else {
                req.flash('success', 'Book successfully updated');
                res.redirect('/books');
            }
        })
    }
})

// delete book
router.get('/delete/(:id)', function(req, res, next) {

    let id = req.params.id;

    dbConn.query('DELETE FROM books WHERE id = ' + id, function(err, result) {
        //if(err) throw err
        if (err) {
            // set flash message
            req.flash('error', err.sqlMessage + ' -- ' + err.sql);
        } else {
            // set flash message
            req.flash('success', 'Book successfully deleted! ID = ' + id)
        }
        // redirect to books page
        res.redirect('/books')
    })
})

module.exports = router;