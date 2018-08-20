var express = require('express');
var jwt = require('jsonwebtoken');
var verifyToken = require('../auth');
var Cart = require('../models/cart');
var nodemailer = require('nodemailer');
var User = require('../models/user');
var room = require('../models/room');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'StaffMyTrip',
        pass:  'Tr1pMyStaff'
    }
});

var router = express.Router();
var secret = 'no pain no gain';

router.get('/', (req, res, next) => {
    next();
})

router.get('/cart-user', verifyToken , (req, res) => {
    try {
        jwt.verify(req.token, secret, async (err, authData) => {
            if (err || authData.Name !== req.query.Name)
                res.json({error: 'can not verify signature'});
            let result = await Cart.find({Email: authData.Email, Active: true}).exec();
            if (result.length)
                res.json({cart: result});
            else
                res.json({status: 304});
      })
    } catch (err) {
        console.log('Error while uploading an image: ' + err);
    }
});

// add an item to the cart
router.post('/add', verifyToken, (req, res) => {
    try {
        jwt.verify(req.token, secret, async (err, authData) => {
            if (err || authData.Name !== req.body.Name)
                res.json({error: 'can not verify user'});
        let result = await Cart.find({Room: req.body.Room, Email: authData.Email}).exec();
        let trip = await room.findOne({Name: req.body.Room}).exec();
        if (!result.length)
        {
            var newCart = new Cart({
                Email: authData.Email,
                Room: req.body.Room,
                Active: true,
                Price: trip.Price,
                Amount: 1
            })
            console.log(newCart);
            await newCart.save();
        }
        else if (result[0].Active)
            await Cart.updateOne({Room: req.body.Room, Email: authData.Email}, {$inc: {Amount: 1}}).exec();
        else
            await Cart.update({Room: req.body.Room, Email: authData.Email}, {$set: {Active: true, Amount: 1}});
        
         res.json({status: 200});
        console.log('Succeffuly add an item !');
      })
    } catch (err) 
    {
        console.log('Error while uploading an image: ' + err);
    }
});

// delete an item from the cart
router.delete('/delete', verifyToken, (req, res) => {
    try {
        jwt.verify(req.token, secret, async (err, authData) => {
            if (err || authData.Name !== req.body.Name)
                res.json({error: 'can not verify signature'});
        await Cart.update({Email: authData.Email, Room: req.body.Room}, {$set: {Active: false}}).exec();
        res.json({status: 200});
        console.log('Succeffuly delete an item');
      })
    } catch (err) 
    {
        console.log('Error while deleting an item for the cart: ' + err);
    }
});

router.delete('/delete-all', verifyToken, (req, res) => {
    try {
        jwt.verify(req.token, secret, async (err, authData) => {
            if (err || authData.Name !== req.body.Name)
                res.json({error: 'can not verify signature'});
        await Cart.updateMany({Email: authData.Email}, {$set: {Active: false}}).exec();
        res.json({status: 200});
        console.log('Succeffuly delete an item');
      })
    } catch (err) 
    {
        console.log('Error while reseting the cart: ' + err);
    }
})

// processing the purchase like, sending a mail for each room requested
router.delete('/process', verifyToken ,(req, res) => {
    try {
        jwt.verify(req.token, secret, async (err, authData) => {
            if (err || authData.Name !== req.body.Name)
            res.json({error: 'can not verify signature'});
            let result = await Cart.find({Email: authData.Email, Active: true}).exec();
            var total = 0;
            var summary = "";
            console.log('length: ' + result.length);
            for (var i = 0; i < result.length; ++i)
            {
                summary += result[i].Amount + ' people to ' + result[i].Room + ' for ' + result[i].Price + '$\n';
                total += result[i].Amount * result[i].Price;
            }
            console.log('total: ' + total + ' summary: \n' + summary);
            var mailOption = {
                from: 'StaffMyTrip@gmail.com',
                //to: authData.Email,
                to: 'simoyall@gmail.com',
                subject: 'Electronic Ticket',
                attachement: [
                    {
                        path: 'http://travel.lbl.gov/images/travel/receipt_examples/', 
                        filename: 'carlson_goodreceipt.pdf'
                    }],
                text: summary + '\nWith pleasure, hope to see you soon again.\nMyTrip'
            }
            transporter.sendMail(mailOption, (err, info) => {
                if (err)
                    res.json({error: 'An error occured ' + err});
                else
                    res.json({info})
            });
            await Cart.update({Email: authData.Email}, {$set: {Active: false}});
            console.log('Check out success !');
        })
    } catch (err) 
    {
        console.log('Error while processing the cart: ' + err);
    }
})

module.exports = router;
