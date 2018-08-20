var router = require('express').Router();
var Message = require('../models/message');
var multer = require('multer');
var verifyToken = require('../auth');
var jwt = require('jsonwebtoken');
var liked = require('../models/userLike');
var secret = 'no pain no gain';

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './public/images');
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
        cb(null, true);
    } else {
        cb('Forbidden Extension');
    }
  };
var upload = multer({
    storage: storage,
    fileFilter: fileFilter
}).single('file');

router.get('/', (req, res, next) => {
    next();
})

router.post('/uploads' ,(req, res) => {
    try {
        // jwt.verify(req.token, secret, async (err, authData) => {
        //     if (err)
        //         throw err;
            upload(req, res, async (err) => {
                if (err)
                    res.json({error: err});
                var newMessage = new Message({
                    Sender: '',    
                    Room: '',
                    Content: req.file.path,
                    Like: 0,
                    Dislike: 0,
                    Date: Date.now(),
                    Active: true
                });
                await newMessage.save();
                console.log('Success of uploading !');
                res.json({status: 200});
            })
        // })
    } catch (err) 
    {
        console.log('Error while uploading an image: ' + err);
    }
});

router.get('/rooms-conversations', verifyToken ,async (req, res) => {
    try {
        jwt.verify(req.token, secret, async (err, authData) => {
            if (err)
                throw err;
            let result = await Message.find({Active: true, Room: req.query.Name}).sort({'Date': -1}).limit(20).exec();
            res.json({message: result});
        })
    } catch (err) {
        console.log('Error while getting chat from a group: ' + err);
    } 
})

router.get('/personal-conversation', verifyToken, async (req, res) => {
    try {
        jwt.verify(req.token, secret, async (err, authData) => {
            if (err)
                throw err;
            let result = await Message.find({Active: true, Room: req.query.Room}).sort({'Date': -1}).limit(20).exec();
            if (result)
                res.json({result});
            else    
                res.json({result: 'empty'});
        })
    } catch (err) {
        console.log('Error while getting a personal chat: ' + err);
    } 
})

router.post('/liked-message', verifyToken, (req, res) => {
    try {
        jwt.verify(req.token, secret, async (err, authData) => {
            if (err)
                throw err;
            let result = await liked.find({Active: true, Room: req.body.Room, Message: req.body.Message}).sort({'Date': -1}).exec();
            if (result)
                res.json({result});
            else    
                res.json({result: ''});
        })
    } catch (err) {
        console.log('Error while getting liked-message: ' + err);
    }
});

router.post('/disliked-message', verifyToken, (req, res) => {
    try {
        jwt.verify(req.token, secret, async (err, authData) => {
            if (err)
                throw err;
                let result = await disliked.find({Active: true, Room: req.body.Room, Message: req.body.Message}).sort({'Date': -1}).exec();
                res.json({result});
        })
    } catch (err) {
        console.log('Error while getting liked-message: ' + err);
    }
});

// SHOULD BE ACCESSIBLE ONLY TO ADMINS
router.put('delete-message', verifyToken, (req, res) => {
    try {
        jwt.verify(req.token, secret, async (err, authData) => {
            if (err)
            res.json({status: 404});
                await Message.update({Message: req.body.Message}, {$set: {Active: false}}).exec();
                res.json({status: 200});
        })
    } catch (err) {
        console.log('Error while getting liked-message: ' + err);
    }
})

module.exports = router;

