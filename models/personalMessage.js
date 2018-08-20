var mongoose = require('mongoose');

let personalMessageSchema = new mongoose.Schema({
    Sender: String,    
    Receiver: String,
    Content: String,
    Date: Date,
    Active: Boolean
}, { versionKey: false, strict: false });

var personalMessage = mongoose.model('personalMessage', personalMessageSchema, 'personalMessages');

personalMessageSchema.pre('save', function(next) {
    let currentDate = new Date();
    this.Date = currentDate;
    next();
});

module.exports = personalMessage;