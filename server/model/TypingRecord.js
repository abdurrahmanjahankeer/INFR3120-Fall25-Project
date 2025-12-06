let mongoose = require('mongoose');

// Create a model class
let typingRecordModel = mongoose.Schema({
	username: String,
	wordsPerMinute: Number,
	accuracy: Number,
	timeTaken: Number,
	textPrompt: String,
	dateCompleted: Date
},
{
	collection: "typingRecords"
});

module.exports = mongoose.model('TypingRecord', typingRecordModel);
