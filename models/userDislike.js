var mongoose = require('mongoose');

var userDislikeSchema = new mongoose.Schema({
    User: String,
    Message: String,
    Room: String,
    Active: Boolean
});

var userDislike = mongoose.model('userDislike', userDislikeSchema, 'userDislikes');

module.exports = userDislike;