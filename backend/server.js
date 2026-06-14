const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const authRoutes = require('./routes/auth');
const skillRoutes = require('./routes/skills');
const requestRoutes = require('./routes/requests');
const messageRoutes = require('./routes/messages');
const notificationRoutes = require('./routes/notifications');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const Message = require('./models/Message');
const User = require('./models/user');

app.use('/api/auth', authRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Skill Exchange API is running!' });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: 'API endpoint not found', path: req.path });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.status || 500).json({ 
    message: err.message || 'Server error!',
    ...(process.env.NODE_ENV === 'development' && { error: err.stack })
  });
});

const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('register_user', (userId) => {
    if (userId) {
      connectedUsers.set(userId, { socketId: socket.id, lastSeen: new Date() });
      User.findByIdAndUpdate(userId, { 
        onlineStatus: 'online',
        lastSeen: new Date()
      }).catch(err => console.error('Error updating online status:', err.message));
    }
  });

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log('User joined room:', roomId);
  });

  socket.on('send_message', (data) => {
    socket.to(data.roomId).emit('receive_message', data);
  });

  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('typing', data);
  });

  socket.on('stop_typing', (data) => {
    socket.to(data.roomId).emit('stop_typing', data);
  });

  socket.on('get_user_status', async (userId, callback) => {
    try {
      const user = await User.findById(userId).select('onlineStatus lastSeen');
      callback({ 
        onlineStatus: user?.onlineStatus || 'offline', 
        lastSeen: user?.lastSeen 
      });
    } catch (err) {
      callback({ onlineStatus: 'offline', lastSeen: null });
    }
  });

  socket.on('message_delivered', async (data) => {
    if (data.messageId) {
      try {
        await Message.findByIdAndUpdate(data.messageId, {
          status: 'delivered',
          deliveredAt: new Date()
        });
      } catch (err) {
        console.error('Error updating delivered status:', err.message);
      }
    }
    socket.to(data.roomId).emit('message_delivered', data);
  });

  socket.on('message_read', async (data) => {
    if (data.messageId) {
      try {
        await Message.findByIdAndUpdate(data.messageId, {
          status: 'read',
          readAt: new Date()
        });
      } catch (err) {
        console.error('Error updating read status:', err.message);
      }
    }
    socket.to(data.roomId).emit('message_read', data);
  });

  socket.on('disconnect', (reason) => {
    console.log('User disconnected:', socket.id, reason);
    for (const [userId, userData] of connectedUsers.entries()) {
      if (userData.socketId === socket.id) {
        connectedUsers.delete(userId);
        User.findByIdAndUpdate(userId, { 
          onlineStatus: 'offline',
          lastSeen: new Date()
        }).catch(err => console.error('Error updating offline status:', err.message));
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected!');
    server.listen(PORT, () => {
      console.log('Server running on port', PORT);
    });
  })
  .catch((err) => {
    console.log('MongoDB Error:', err.message);
    server.listen(PORT, () => {
      console.log('Server running on port', PORT, '(without DB)');
    });
  });