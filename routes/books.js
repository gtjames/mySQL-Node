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
        title: '',                   //  no data because we are adding a new book
        author: ''
    })
})

// add a new book
//      this is a POST request. We are receiving data back from the client
router.post('/add', function(req, res, next) {

    let title = req.body.title;           //  the body object from the client contains our data
    let author = req.body.author;

    if(title.length === 0 || author.length === 0) {      //  not so fast. If you didn't enter anything we are not going to add that
        // set flash message
        req.flash('error', "Please enter author and title");
        // render to add.ejs with flash message
        res.render('books/add', {
            title: title,     //  notice we return the data we did get. So if one of these is filled in
            author: author  //  then it will get displayed back on the page
        })
    }   else {                  // if no error
        var form_data = {
            title: title,
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
                    author: form_data.author,
                    title: form_data.title
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
                author: rows[0].author,
                title: rows[0].title
            })
        }
    })
})

// update book data
router.post('/update/:id', function(req, res, next) {

    let id = req.params.id;
    let author = req.body.author;
    let title = req.body.title;

    if(title.length === 0 || author.length === 0) {
        // set flash message
        req.flash('error', "Please enter title and author");
        // render to add.ejs with flash message
        res.render('books/edit', {
            id: req.params.id,
            author: author,
            title: title
        })
    } else {            // if no error
        var form_data = { author: author, title: title };

        // update query
        dbConn.query('UPDATE books SET ? WHERE id = ' + id, form_data, function(err, result) {
            //if(err) throw err
            if (err) {
                // set flash message
                req.flash('error', err)
                // render to edit.ejs
                res.render('books/edit', {
                    id: req.params.id,
                    author: form_data.author,
                    title: form_data.title
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

// search crime
router.post('/search', function(req, res, next) {

    let column = req.body.attrib;
    let value = req.body.search;

    dbConn.query(
        `SELECT *
         FROM books
         WHERE ${column} like '%${value}%'
         limit 100`,
        function(err,rows)     {
            if(err) {
                req.flash('error', err);
                // render to views/crimes/index.ejs
                res.render('books',{data:''});          //  notice all data back to the client is in a JSON object
            } else {
                // render to views/crimes/index.ejs
                res.render('books',{data:rows});        //  JSON data of the list of crimes
            }
        });
})

module.exports = router;