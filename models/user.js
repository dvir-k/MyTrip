var mongoose = require('mongoose');

let UserSchema = new mongoose.Schema({
    Name: String,
    Email: {type: String, required: true, unique: true},
    Password: {type: String, required: true},
    Status: { type: String, enum: ['Admin', 'Guide' ,'Member'], default: 'Member'},
    Active: Boolean,
    Picture: {type: String }
}, { versionKey: false, strict: false });

var User = mongoose.model('User', UserSchema, 'Users');

module.exports = User;