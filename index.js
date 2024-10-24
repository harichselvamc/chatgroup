// server/index.js

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Initialize Express app
const app = express();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server);

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

// Handle Socket.io connections
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Listen for joining a room
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);

    // Notify others in the room
    socket.to(roomId).emit('userJoined', socket.id);
  });

  // Listen for chat messages
  socket.on('chatMessage', ({ roomId, message }) => {
    // Broadcast the message to all other clients in the room
    socket.to(roomId).emit('chatMessage', { sender: socket.id, message });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    // Optionally, notify others in the room
    // socket.to(roomId).emit('userLeft', socket.id);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
