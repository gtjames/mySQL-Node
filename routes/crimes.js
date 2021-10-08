var express = require('express');
var router = express.Router();
var dbConn  = require('../lib/db');         //  yes, this is our connection variable from the db.js file

//  display crimes page when the url is "crimes/"
//  remember back in app.js we defined all /crimes requests would come here
//  so in this code we only reference the rest of the URL
router.get('/', function(req, res, next) {

    //  We are just using plain old SQL to hit the database.
    //                                                  OH LOOK! a callback function
    dbConn.query('SELECT CrimeId, ComplaintNum, ReportDate, OffenseDesc, Borough, PremiseType ' +
        ' FROM crimes ' +
        ' ORDER BY ReportDate desc' +
        ' limit 100',
        function(err,rows)     {
            if(err) {
                req.flash('error', err);
                // render to views/crimes/index.ejs
                res.render('crimes',{data:''});          //  notice all data back to the client is in a JSON object
            } else {
                // render to views/crimes/index.ejs
                res.render('crimes',{data:rows});        //  JSON data of the list of crimes
            }
        });
});

// display add crime page
//      URL:            /crimes/add
router.get('/add', function(req, res, next) {
    // render to add.ejs
    res.render('crimes/add', {
        CrimeId: '',
        ComplaintNum: '',
        ReportDate: '',
        OffenseDesc: '',
        Borough: '',
        PremiseType: ''                   //  no data because we are adding a new crime
    })
})

// add a new crime
//      this is a POST request. We are receiving data back from the client
router.post('/add', function(req, res, next) {

    let ComplaintNum = req.body.ComplaintNum;
    let ReportDate = req.body.ReportDate;
    let OffenseDesc = req.body.OffenseDesc;
    let Borough = req.body.Borough;
    let PremiseType = req.body.PremiseType;

    //  not so fast. If you didn't enter anything we are not going to add that
    if(ComplaintNum.length === 0 || ReportDate.length === 0 || OffenseDesc.length === 0 || Borough.length === 0 || PremiseType.length === 0) {
        // set flash message
        req.flash('error', "Please enter in the missing fields");
        // render to add.ejs with flash message
        res.render('crimes/add', {
            ComplaintNum: ComplaintNum,     //  notice we return the data we did get. So if one of these is filled in
            ReportDate: ReportDate,  //  then it will get displayed back on the page
            OffenseDesc: OffenseDesc,
            Borough: Borough,
            PremiseType: PremiseType
        })
    }   else {                  // if no error
        var form_data = {
            ComplaintNum: ComplaintNum,
            ReportDate: ReportDate,
            OffenseDesc: OffenseDesc,
            Borough: Borough,
            PremiseType: PremiseType
        }

        // insert query
        //      calling the database                        and waiting for the callback results over here
        dbConn.query('INSERT INTO crimes SET ?', form_data, function(err, result) {
            //if(err) throw err
            if (err) {
                req.flash('error', err)

                // render to add.ejs
                res.render('crimes/add', {
                    ComplaintNum: form_data.ComplaintNum,
                    ReportDate: form_data.ReportDate,  //  then it will get displayed back on the page
                    OffenseDesc: form_data.OffenseDesc,
                    Borough: form_data.Borough,
                    PremiseType: form_data.PremiseType
                })
            } else {
                req.flash('success', 'Crime successfully added');
                res.redirect('/crimes');
            }
        })
    }
})

// display edit crime page
router.get('/edit/(:id)', function(req, res, next) {

    let id = req.params.id;

    dbConn.query('SELECT CrimeId, ComplaintNum, ReportDate, OffenseDesc, Borough, PremiseType FROM crimes WHERE CrimeId = ' + id, function(err, rows, fields) {
        if(err) throw err

        // if user not found
        if (rows.length <= 0) {
            req.flash('error', 'Crime not found with id = ' + id)
            res.redirect('/crimes')
        }
        // if crime found
        else {
            // render to edit.ejs
            res.render('crimes/edit', {
                title: 'Edit Crime',
                CrimeId: rows[0].CrimeId,     //  notice we return the data we did get. So if one of these is filled in
                ComplaintNum: rows[0].ComplaintNum,
                ReportDate: rows[0].ReportDate,  //  then it will get displayed back on the page
                OffenseDesc: rows[0].OffenseDesc,
                Borough: rows[0].Borough,
                PremiseType: rows[0].PremiseType
            })
        }
    })
})

// update crime data
router.post('/update/:id', function(req, res, next) {

    let CrimeId = req.params.id;
    let ComplaintNum = req.body.ComplaintNum;
    let ReportDate = req.body.ReportDate;
    let OffenseDesc = req.body.OffenseDesc;
    let Borough = req.body.Borough;
    let PremiseType = req.body.PremiseType;

    if(ComplaintNum.length === 0 || ReportDate.length === 0 || OffenseDesc.length === 0 || Borough.length === 0 || PremiseType.length === 0) {
        // set flash message
        req.flash('error', "Please enter name and author");
        // render to add.ejs with flash message
        res.render('crimes/edit', {
            CrimeId: CrimeId,     //  notice we return the data we did get. So if one of these is filled in
            ComplaintNum: ComplaintNum,
            ReportDate: ReportDate,  //  then it will get displayed back on the page
            OffenseDesc: OffenseDesc,
            Borough: Borough,
            PremiseType: PremiseType
        })
    } else {            // if no error
        var form_data = {
            ComplaintNum: ComplaintNum,
            ReportDate: ReportDate,
            OffenseDesc: OffenseDesc,
            Borough: Borough,
            PremiseType: PremiseType
        }

        // update query
        dbConn.query('UPDATE crimes SET ? WHERE CrimeId = ' + CrimeId, form_data, function(err, result) {
            //if(err) throw err
            if (err) {
                // set flash message
                req.flash('error', err)
                // render to edit.ejs
                res.render('crimes/edit', {
                    CrimeId: CrimeId,
                    ComplaintNum: ComplaintNum,
                    ReportDate: ReportDate,
                    OffenseDesc: OffenseDesc,
                    Borough: Borough,
                    PremiseType: PremiseType
                })
            } else {
                req.flash('success', 'crime successfully updated');
                res.redirect('/crimes');
            }
        })
    }
})

// delete crime
router.get('/delete/(:id)', function(req, res, next) {

    let id = req.params.id;

    dbConn.query('DELETE FROM crimes WHERE CrimeId = ' + id, function(err, result) {
        //if(err) throw err
        if (err) {
            // set flash message
            req.flash('error', err.sqlMessage + ' -- ' + err.sql);
        } else {
            // set flash message
            req.flash('success', 'Crime successfully deleted! ID = ' + id)
        }
        // redirect to crimes page
        res.redirect('/crimes')
    })
})

// search crime
router.post('/search', function(req, res, next) {

    let column = req.body.attrib;
    let value = req.body.search;

    dbConn.query(
        `SELECT CrimeId, ComplaintNum, ReportDate, OffenseDesc, Borough, PremiseType
         FROM crimes
         WHERE ${column} like '%${value}%'
         ORDER BY ReportDate desc
         limit 100`,
        function(err,rows)     {
            if(err) {
                req.flash('error', err);
                // render to views/crimes/index.ejs
                res.render('crimes',{data:''});          //  notice all data back to the client is in a JSON object
            } else {
                // render to views/crimes/index.ejs
                res.render('crimes',{data:rows});        //  JSON data of the list of crimes
            }
        });
})

module.exports = router;