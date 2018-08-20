var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var verifyToken = require('../auth');
var roomUser = require('../models/room_user');
var User = require('../models/user');
var secret = 'no pain no gain';
var userRoom = require('../models/room_user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', async (req, res) => {
  try {
    let result = await User.find({Active: true, Email: req.body.Email, Password: req.body.Password}).exec();
    if (!result.length)
        res.json({error: 'Username / Password are not correct'});
    
    jwt.sign({Name: result[0].Name, Email: result[0].Email}, secret, {expiresIn: 15*60}, (err, token) => {
      if (err)
          res.json({status: 404});
      res.json({token: token, user: result[0].Name});
    });
  } catch(err)
  {
      console.log('Error while logging in: ' + err);
  }
});

router.post('/signup', async (req, res) => {
  try {
    console.log('signup someone');
  let result = await User.find({Active: true, Email: req.body.Email, Password: req.body.Password}).exec();
  if (result.length)
     res.json({error: 'This email is attached to an another account'});
  let user = new User({
    Name: req.body.Name,
    Email: req.body.Email,
    Password: req.body.Password,
    Status: req.body.Status,
    Active: true,
    Picture: ''
  });
  await user.save();
  var nameee = req.body.Name;
  console.log(req.bo)
  jwt.sign({Name: nameee, Email: req.body.Email}, secret, {expiresIn: 60 * 15}, (err, token) => {
    if (err)
      throw err;
    res.json({token: token});
  });
  } catch(err)
  {
    console.log('Error on signup: ' + err);
  }
});

// Get all the room of an user
router.post('/mygroup', verifyToken, (req, res) => {
  try {
      jwt.verify(req.token, secret, async (err, authData) => {
          if (err)
            res.json({status: 404});
          let result = await roomUser.find({User: authData.Name}, {Name: 1}).exec();
          if (!result)
            res.json({message: 'No room'});
          else
            res.json({room: result})
      });
  } catch(err)
  {
      console.log('Error while getting all rooms of an user: ' + err);
  }
});

// Get all the user 
router.get('/user-room', verifyToken, (req, res) => {
    try {
      jwt.verify(req.token, secret, async (err, authData) => {
        if (err)
          res.json({status: 404});
        let result = await userRoom.find({Name: authData.Name}).exec();
        if (result)
          res.json({result});
        res.json(null);
      })
    } catch (err)
    {
        console.log('Error while getting all user of a room: ' + err);
    }
});

// updating the statut of an user on the website not on ROOM
router.put('/updateUser', verifyToken, (req, res) => {
  try {
    jwt.verify(req.token, secret, async (err, authData) => {
      if (err)
        res.json({error: 'can not trust your identity'});
      await User.update({Name: req.body.Name}, {$set: {Status: req.body.Status}}).exec();
      res.json({status: 200});
    })
  } catch (err)
  {
      console.log('Error while updating an user: ' + err);
  }
});

router.delete('/delete', verifyToken, (req, res) => {
      try {
        jwt.verify(req.token, secret, async (err, authData) => {
          if (err)
            res.json({error: 'can not trust your identity'});
            console.log(req.body.Name);
          await User.update({Name: req.body.Name}, {$set: {Active: false}}).exec();
          res.json({status: 200});
        })
      } catch (err)
      {
          console.log('Error while deleting an user: ' + err);
      }
})

// SHOULD BE ONLY ACCESSIBLE TO ADMIN 
router.get('/all', verifyToken, (req, res) => {
    try {
      jwt.verify(req.token, secret, async (err, authData) => {
        if (err)
          res.json({error: 'can not trust your identity'});
        let result = await User.find({Active: true}, {Password: 0}).exec();
        res.json({users: result});
      })
    } catch (err)
    {
        console.log('Error while getting all users: ' + err);
    }
});


module.exports = router;
