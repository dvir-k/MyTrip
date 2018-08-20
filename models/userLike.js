var mongoose = require('mongoose');

var userLikeSchema = new mongoose.Schema({
    User: String,
    Message: String,
    Room: String,
    Active: Boolean
});

var userLike = mongoose.model('userLike', userLikeSchema, 'userLikes');

module.exports = userLike;