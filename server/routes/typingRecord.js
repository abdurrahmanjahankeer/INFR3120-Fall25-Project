let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');

// Connect to our TypingRecord model
let TypingRecord = require('../model/typingRecord');

function requireAuth(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.redirect('/login');
    }
    next();
}

// GET route for displaying the data from DB --> Read Operation
router.get('/', async (req, res, next) => {
    try {
        const RecordList = await TypingRecord.find();
        res.render('TypingRecords/list', {
            title: 'Typing Records',
            RecordList: RecordList,
            displayName: req.user ? req.user.displayName : ""
        });
    }
    catch (err) {
        console.log(err);
        res.render('TypingRecords/list', {
            error: 'Error on the Server'
        });
    }
});

// GET route for displaying the Add Page --> Create Operation
router.get('/add', async (req, res, next) => {
    try {
        res.render('TypingRecords/add', {
            title: 'Add Typing Record',
            displayName: req.user ? req.user.displayName : ""
        });
    }
    catch (err) {
        console.log(err);
        res.render('TypingRecords/list', {
            error: 'Error on the Server'
        });
    }
});

// POST route for processing the Add Page --> Create Operation
router.post('/add', async (req, res, next) => {
    try {
        let newRecord = TypingRecord({
            "username": req.body.username,
            "wordsPerMinute": req.body.wordsPerMinute,
            "accuracy": req.body.accuracy,
            "timeTaken": req.body.timeTaken,
            "textPrompt": req.body.textPrompt,
            "dateCompleted": new Date()
        });
        TypingRecord.create(newRecord).then(() => {
            res.redirect('/typingRecords');
        });
    }
    catch (err) {
        console.log(err);
        res.render('TypingRecords/list', {
            error: 'Error on the Server'
        });
    }
});

// GET route for displaying the Edit Page --> Update Operation
router.get('/edit/:id', async (req, res, next) => {
    try {
        const id = req.params.id;
        const recordToEdit = await TypingRecord.findById(id);
        res.render("TypingRecords/edit", {
            title: 'Edit Typing Record',
            Record: recordToEdit,
            displayName: req.user ? req.user.displayName : ""
        });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});

// POST route for processing the Edit Page --> Update Operation
router.post('/edit/:id', async (req, res, next) => {
    try {
        let id = req.params.id;
        let updateRecord = TypingRecord({
            "_id": id,
            "username": req.body.username,
            "wordsPerMinute": req.body.wordsPerMinute,
            "accuracy": req.body.accuracy,
            "timeTaken": req.body.timeTaken,
            "textPrompt": req.body.textPrompt,
            "dateCompleted": req.body.dateCompleted
        });
        TypingRecord.findByIdAndUpdate(id, updateRecord).then(() => {
            res.redirect("/typingRecords");
        });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});

// GET route to perform Delete Operation
router.get('/delete/:id', async (req, res, next) => {
    try {
        let id = req.params.id;
        TypingRecord.deleteOne({ _id: id }).then(() => {
            res.redirect("/typingRecords");
        });
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});

module.exports = router;