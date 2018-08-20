var router = require('express').Router();
var morgan = require('morgan');
var room = require('../models/room');
var userRoom = require('../models/room_user');
var mkdir = require('mkdirp');
var verifyToken = require('../auth');
var jwt = require('jsonwebtoken');
var secret = 'no pain no gain';

router.get('/', (req, res, next) => {
    next();
})

// create a new room
router.post('/new', verifyToken, (req, res) => {
    try {
        jwt.verify(req.token, secret, async (err, authData) => {
            if (err)
                res.json({error: 'can not verify your identity'});
            let newRoom = new room({
                Name: req.body.Name,
                Description: req.body.Description, 
                Price: req.body.Price,
                Picture: req.body.Picture,
                Active: true,
                Admin: req.body.Admin
            });
        await newRoom.save();
        console.log('Room successfully created !');
        res.json({status: 200});
      })
    } catch (err) {
      console.log('Error while adding a new room: ' + err);
    }
});

// getting all the room
router.get('/all', verifyToken ,(req, res) => {
    try {
        jwt.verify(req.token, secret, async (err, authData) => {
            if (err)
                res.json({error: 'Can not trust your identity'});
                let result = await room.find({}).exec();
                res.json({room: result});
        });
    } catch (err)
    {
        console.log('Error while looking for places: ' + err);
    }
});

// info of a room
router.get('/room-info', async (req, res) => {
    try {
        let result = await room.find({ Name: req.query.Name, Active: true}).exec();
        res.json({room: result});
    } catch (err)
    {
        console.log('Error while looking for a particular room: ' + err);
    }
})

// getting all the room of an user
router.get('/room-user', verifyToken, (req, res) => {
    try {
        jwt.verify(req.token, secret, async (err, authData) => {
            if (err)
                res.json({error: 'Can not verify signature'});
            let result = await userRoom.find({User: authData.Name, Active: true}).exec();
            res.json({room: result, name: authData.Name});
        });
    } catch (err)
    {
        console.log('Error while looking for rooms of an user: ' + err);
    }
});

// looking for a particular place
router.get('/places', verifyToken, (req, res) => {
    try {
        jwt.verify(req.token, secret, async (err, authData) => {
            if (err)
                throw err;
                let result = await room.find({Title: req.query.Title}).exec();
                if (!result) 
                    res.json({status : 404});
                res.json({room: result});
        });
    } catch (err)
    {
        console.log('Error while looking for places: ' + err);
    }
})

// removing a room
router.delete('/delete', verifyToken, (req, res) => {
    try {
        jwt.verify(req.token, secret, async (err, authData) => {
            if (err)
                throw err;
            await room.update({Name: req.body.Name}, {$set: {Active: false}}).exec();
            await userRoom.update({Name: req.body.Name}, {$set: {Active: false}}).exec();
            res.json({status: 200})
      })
    } catch (err) 
    {
        console.log('Error while deleting a room: ' + err);
    }
});

router.post('/join', verifyToken, (req, res) => {
    try {
        jwt.verify(req.token, secret, async (err, authData) => {
            if (err || authData.Name !== req.body.Name)
                res.json({error: 'can not verify signature'});
            var newuserRoom = new userRoom({
                User: req.body.Name,
                Name: req.body.Room,
                Status: 'Member', 
                Active: true
            });
            console.log(newuserRoom);
            await newuserRoom.save();
            res.json({status: 200});
      })
    } catch (err) 
    {
        console.log('Error while joining a room: ' + err);
    }
})

// leaving a room, SHOULD ADD VERIFICATION IF THE USER IS REGULAR OR ADMIN
router.delete('/leave', verifyToken, (req, res) => {
    try {
        jwt.verify(req.token, secret, async (err, authData) => {
            if (err || authData.Name !== req.body.Name)
                res.json({error: 'can not verify signature'});
            // checking if someone else is responsible of this room
            let result = await room.find({Name: req.body.Room, Admin: authData.Name, Active: true}).exec();
            if (!result.length)
            {   
                await userRoom.update({Room: req.body.Room, User: authData.Name}, {$set: {Active: false}}).exec();
                console.log('Simply leave the room');
            }
            else
            {
                let result2 = await userRoom.find({Room: req.body.Room, Active: true}, {User: 1}).exec();
                if (result2.length)
                {
                    a = Math.floor(Math.random() * result2.length);
                    let end = await userRoom.updateOne({Room: req.body.Room, User: result2[a].User}, {$set: {Status: 'Admin'}}, {new: true}).exec();
                    console.log('update: ' + result2[a].User + ' as ' + end.Status);
                }
            }
            res.json({status: 200});
      })
    } catch (err) 
    {
        console.log('Error while leaving a room: ' + err);
    }
});






module.exports = router;