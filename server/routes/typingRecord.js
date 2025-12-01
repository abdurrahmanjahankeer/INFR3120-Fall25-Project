let userModel = require('../model/user');
let User = userModel.User;

let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');
// Connect to our TypingRecord model
let TypingRecord = require('../model/TypingRecord');

function requireAuth(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.redirect('/login')
    }
    next();
}

// GET route for displaying the TOP 10 leaderboard from DB --> Read Operation
router.get('/', async (req, res, next) => {
    try {
        // Get top 10 records sorted by WPM (descending), then by accuracy (descending)
        const RecordList = await TypingRecord.find()
            .sort({ wordsPerMinute: -1, accuracy: -1 })
            .limit(10);

        res.render('TypingRecords/list', {
            title: 'Top 10 Leaderboard',
            RecordList: RecordList,
            displayName: req.user ? req.user.username : "",
            isLoggedIn: req.isAuthenticated()
        });
    }
    catch (err) {
        console.log(err);
        res.render('TypingRecords/list', {
            error: 'Error on the Server',
            title: 'Error',
            RecordList: [],
            displayName: req.user ? req.user.username : ""
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
            error: 'Error on the Server',
            title: 'Error',
            RecordList: [],
            displayName: req.user ? req.user.displayName : ""
        });
    }
});

// POST route for processing the Add Page --> Create Operation
router.post('/add', requireAuth, async (req, res, next) => {
    try {
        // User must be logged in to add a record
        // Use the actual username from the User model, not displayName
        let usernameToUse = req.user.username;

        let newRecord = TypingRecord({
            "username": usernameToUse,
            "wordsPerMinute": req.body.wordsPerMinute,
            "accuracy": req.body.accuracy,
            "timeTaken": req.body.timeTaken,
            "textPrompt": req.body.textPrompt,
            "dateCompleted": new Date()
        });
        await TypingRecord.create(newRecord);
        
        // If AJAX request, send JSON response
        if (req.xhr || req.headers.accept.indexOf('application/json') > -1) {
            res.json({ success: true, message: 'Record added successfully' });
        } else {
            res.redirect('/typingRecords');
        }
    }
    catch (err) {
        console.log(err);
        // If AJAX request, send JSON error
        if (req.xhr || req.headers.accept.indexOf('application/json') > -1) {
            res.status(500).json({ success: false, error: 'Error on the Server' });
        } else {
            res.render('TypingRecords/add', {
                error: 'Error on the Server',
                title: 'Error',
                displayName: req.user ? req.user.displayName : ""
            });
        }
    }
});

// GET route for displaying the Edit Page --> Update Operation
router.get('/edit/:id', requireAuth, async (req, res, next) => {
    try {
        const id = req.params.id;
        const recordToEdit = await TypingRecord.findById(id);

        // Check if the record belongs to the logged-in user
        if (!recordToEdit || recordToEdit.username !== req.user.username) {
            return res.redirect('/typingRecords');
        }

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
router.post('/edit/:id', requireAuth, async (req, res, next) => {
    try {
        let id = req.params.id;
        const existingRecord = await TypingRecord.findById(id);

        // Check if the record belongs to the logged-in user
        if (!existingRecord || existingRecord.username !== req.user.username) {
            return res.redirect('/typingRecords');
        }

        let updateRecord = TypingRecord({
            "_id": id,
            "username": req.user.username,
            "wordsPerMinute": req.body.wordsPerMinute,
            "accuracy": req.body.accuracy,
            "timeTaken": req.body.timeTaken,
            "textPrompt": req.body.textPrompt,
            "dateCompleted": req.body.dateCompleted
        });

        await TypingRecord.findByIdAndUpdate(id, updateRecord);
        res.redirect("/typingRecords");
    }
    catch (err) {
        console.log(err);
        next(err);
    }
});

// GET route to perform Delete Operation
router.get('/delete/:id', requireAuth, async (req, res, next) => {
    try {
        let id = req.params.id;
        const recordToDelete = await TypingRecord.findById(id);

        // Check if the record belongs to the logged-in user
        if (!recordToDelete || recordToDelete.username !== req.user.username) {
            return res.redirect('/typingRecords');
        }

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