var mongoose = require('mongoose');

let roomUserSchema = new mongoose.Schema({
    User: String,
    Name: String,
    Status: {type: String, enum: ['Admin', 'Member', 'Banned', 'Pending']},
    Active: Boolean
}, { versionKey: false, strict: false });

var roomUser = mongoose.model('roomUser', roomUserSchema, 'roomUsers');

module.exports = roomUser;