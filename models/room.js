var mongoose = require('mongoose');

let RoomSchema = new mongoose.Schema({
    Name: {type: String, required: true, unique: true },
    Description: String, 
    Active: Boolean,
    Picture: String,
    Admin: String,
    Price: Number
}, { versionKey: false, strict: false });

var Room = mongoose.model('Room', RoomSchema, 'RoomsV2');

module.exports = Room;