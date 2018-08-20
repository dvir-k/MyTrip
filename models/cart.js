var mongoose = require('mongoose');

let CartSchema = new mongoose.Schema({
    Email: String,
    Room: String,
    Active: Boolean,
    Price: Number,
    Amount: Number
}, { versionKey: false, strict: false });

var Cart = mongoose.model('Cart', CartSchema, 'Carts');

module.exports = Cart;