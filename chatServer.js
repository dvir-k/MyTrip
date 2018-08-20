var message = require('./models/message');
var userRoom = require('./models/room_user');

module.exports = function(io) {
    io.on('connection', function(socket) {
        
        socket.on('join', async (data) => {
            try {
                socket.join(data.room);
                console.log('User ' + data.user + ' has joined the room ' + data.room);
                var newUsers = new userRoom({
                    User: data.User,
                    Name: data.room,
                    Status: 'Member',
                    Active: true
                });
                let find = await userRoom.find({User: data.User, Name: data.room, Active: true}).exec();
                if (!find.length)
                    await newUsers.save();
                let result = await message.find({Room: data.room, Active: true}).sort({Date: -1}).limit(20).exec();
                console.log('result: ' + result.length);
                if (!result.length)
                    socket.broadcast.to(data.room).emit('new user joined', {user: data.user, message: 'has join this room'});
                else
                    socket.broadcast.to(data.room).emit('', {user: data.user, message: result});
            } catch (err) {
                console.log('error on join from socket: ' + err);
            }
        });
    
        socket.on('exit', async (data) => {
            try {
                console.log('User ' + data.user + ' left the room ' + data.room);
                let result = await userRoom.update({User: data.user, Name: data.room}, {$set: {Active: false}}).exec();
                socket.broadcast.to(data.room).emit('left room', {user: data.user, message: 'has left this room'});
                socket.leave(data.room);
            } catch(err) {
                console.log('error on exit from socket.io: ' + err);
            }
        });
    
        socket.on('message', async (data) => {
            try {
                console.log('Event for new message');
            var newMessage = new message({
                Sender: data.user,    
                Room: data.room,
                Content: data.message,
                Like: 0,
                Dislike: 0,
                Date: Date.now(),
                Active: true
            });
            await newMessage.save();
            io.in(data.room).emit('message', newMessage);
            } catch(err) {
                console.log('error on message from socket.io : ' + err);
            }
        });

        socket.on('picture', async (data) => {
            try {
                console.log('Event for uploaded picture');
                let result = await message.findOneAndUpdate({},{$set: {Sender: data.user, Room: data.room}}, {new: true, sort: {Date: -1}}).exec();
                var newMessage = new message({
                    Sender: data.user,    
                    Room: data.room,
                    Content: result.Content,
                    Like: result.Like,
                    Dislike: result.Dislike,
                    Date: result.Date,
                    Active: true
                })
                io.in(data.room).emit('message', newMessage);
            } catch(err) {
                console.log('error on picture from socket.io : ' + err);
            }
        });

        socket.on('like', async(data) => {
            try {
                var aaa = String(data.Date);
                await message.update({Date: new Date(aaa), Room: data.Room}, {$inc: {Like: 1}}).exec();
                io.in(data.Room).emit('update', '');
            } catch (err) {
                console.log('error on like from socket.io : ' + err);
            }
        });

        socket.on('remove-like', async (data) => {
            try {
                var aaa = String(data.Date);
                await message.updateOne({Date: new Date(aaa)}, {$inc: {Like: -1}}).exec();
                io.in(data.Room).emit('update', '');
            } catch (err) {
                console.log('error on like from socket.io : ' + err);
            }
        });

        socket.on('unlike', async(data) => {
            try {
                var aaa = String(data.Date);
                await message.updateOne({Date: new Date(aaa)}, {$inc: {Dislike: 1}}).exec();
                io.in(data.Room).emit('update', '');
            } catch (err) {
                console.log('error on like from socket.io : ' + err);
            }
        });

        socket.on('remove-unlike', async(data) => {
            try {
                var aaa = String(data.Date);
                await message.updateOne({Date: new Date(aaa)}, {$inc: {Dislike: -1}}).exec();
                io.in(data.Room).emit('update', '');
            } catch (err) {
                console.log('error on like from socket.io : ' + err);
            }
        });

        socket.on('likeAndUnlike', async(data) => {
            try {
                var aaa = String(data.Date);
                await message.updateOne({Date: new Date(aaa)}, {$inc: {Dislike: -1}}).exec();
                await message.updateOne({Date: new Date(aaa)}, {$inc: {Like: 1}}).exec();
                io.in(data.Room).emit('update', '');
            } catch (err) {
                console.log('error on likeAndUnlike from socket.io : ' + err);
            }
        });

        socket.on('unlikeAndLike', async(data) => {
            try {
                var aaa = String(data.Date);
                await message.updateOne({Date: new Date(aaa)}, {$inc: {Like: -1}}).exec();
                await message.updateOne({Date: new Date(aaa)}, {$inc: {Dislike: 1}}).exec();
                io.in(data.Room).emit('update', '');
            } catch (err) {
                console.log('error on likeAndUnlike from socket.io : ' + err);
            }
        });

        socket.on('remove', async (data) => {
            try {
                var aaa = String(data.Date);
                await message.updateOne({Date: new Date(aaa)}, {$set: {Active: false}}).exec();
                io.in(data.Room).emit('update', '');
            } catch (err) {
                console.log('error on remove from socket.io : ' + err);
            }
        })
    });
    return io;
}