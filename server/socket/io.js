const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');

const sockets = new Map();

function initSocket(httpServer){
  const io = new Server(httpServer, {
    cors: { origin: '*' }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if(!token) return next();
    try{
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      socket.userId = payload.id;
      next();
    } catch(err){ next(); }
  });

  io.on('connection', async (socket) => {
    if(socket.userId){
      sockets.set(socket.id, socket.userId.toString());
      await User.findByIdAndUpdate(socket.userId, { online: true });
      io.emit('presence', { userId: socket.userId, online: true });
    }

    socket.on('join-room', (room) => socket.join(room));
    socket.on('leave-room', (room) => socket.leave(room));

    socket.on('typing', ({ room, to }) => {
      if(room) socket.to(room).emit('typing', { userId: socket.userId });
      if(to) socket.to(to).emit('typing', { userId: socket.userId });
    });

    socket.on('send-message', async (payload) => {
      const msg = await Message.create({
        from: socket.userId,
        to: payload.to || null,
        room: payload.room || null,
        content: payload.content
      });
      const full = await msg.populate('from','name');
      if(payload.room){
        io.to(payload.room).emit('message', full);
      } else if(payload.to){
        for(const [sid, uid] of sockets.entries()){
          if(uid === payload.to || uid === socket.userId.toString()){
            io.to(sid).emit('message', full);
          }
        }
      }
    });

    socket.on('mark-read', async ({ messageId }) => {
      const msg = await Message.findById(messageId);
      if(!msg) return;
      if(!msg.readBy.includes(socket.userId)){
        msg.readBy.push(socket.userId);
        await msg.save();
      }
      for(const [sid, uid] of sockets.entries()){
        if(uid === msg.from.toString()){
          io.to(sid).emit('read-receipt', { messageId, userId: socket.userId });
        }
      }
    });

    socket.on('disconnect', async () => {
      const userId = sockets.get(socket.id);
      sockets.delete(socket.id);
      if(userId){
        const stillConnected = Array.from(sockets.values()).includes(userId);
        if(!stillConnected){
          await User.findByIdAndUpdate(userId, { online: false });
          io.emit('presence', { userId, online: false });
        }
      }
    });
  });

  return io;
}

module.exports = { initSocket };
