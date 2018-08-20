var mongoose = require('mongoose');

let MessageSchema = new mongoose.Schema({
    Sender: String,    
    Room: String,
    Content: String,
    Like: Number,
    Dislike: Number,
    Date: Date,
    Active: Boolean
}, { versionKey: false, strict: false });

var Message = mongoose.model('Message', MessageSchema, 'Messages');

MessageSchema.pre('save', function(next) {
    let currentDate = new Date();
    this.Date = currentDate;
    next();
});

module.exports = Message;