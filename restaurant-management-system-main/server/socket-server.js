const { Server } = require("socket.io");

const PORT = 3001;

const io = new Server(PORT, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

console.log(`Socket.IO server running on port ${PORT}`);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join-admin", () => {
    socket.join("admins");

    console.log(
      `Admin joined notification room: ${socket.id}`
    );

    socket.emit("admin-joined");
  });

  socket.on("new-order", (order) => {
    console.log("New order received:", order);

    io.to("admins").emit(
      "order-notification",
      order
    );
  });

  socket.on("disconnect", (reason) => {
    console.log(
      "Client disconnected:",
      socket.id,
      "| Reason:",
      reason
    );
  });
});