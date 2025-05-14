// const { Server } = require("socket.io");

// let io;

// const initializeSocket = (server) => {
//   io = new Server(server, {
//     cors: {
//       origin: "http://localhost:5173", // Ensure this matches your frontend URL
//       methods: ["GET", "POST"],
//     },
//   });

//   io.on("connection", (socket) => {
//     console.log(`User Connected: ${socket.id}`);

//     socket.on("join_room", (roomId) => {
//       socket.join(roomId);
//       console.log(`User with ID: ${socket.id} joined room: ${roomId}`);
//     });

//     socket.on("send_message", (data) => {
//       console.log("Sending message:", data); 
      
//       io.in(data.roomId).emit("receive_message", data); // Broadcast to everyone in the room
//     });

//     socket.on("disconnect", () => {
//       console.log("User Disconnected:", socket.id);
//     });
//   });

//   return io;
// };

// const getIO = () => {
//   if (!io) {
//     throw new Error("Socket.IO not initialized!");
//   }
//   return io;
// };

// module.exports = { initializeSocket, getIO };


const { Server } = require("socket.io");

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173", // Adjust for frontend URL
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on("send_message", (data) => {
      io.in(data.roomId).emit("receive_message", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
};

module.exports = { initializeSocket };
