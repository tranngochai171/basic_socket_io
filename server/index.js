import express from "express";
import { Server } from "socket.io";

const PORT = process.env.PORT || 5000;
const ADMIN = "ADMIN";

const app = express();

const expressServer = app.listen(PORT, () => {
  console.log(`Listen on port ${PORT}`);
});

const io = new Server(expressServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "production" ? false : ["http://localhost:5173"],
  },
});

const UserState = {
  users: [],
  setUsers: function (newUsers) {
    this.users = newUsers;
  },
};

io.on("connection", (socket) => {
  console.log(`User ${socket.id} connected`);
  socket.on("getAllActiveRooms", () => {
    socket.emit("roomList", { rooms: getAllActiveRooms() });
  });

  socket.on("enterRoom", ({ name, room }) => {
    console.log("join room");
    const prevRoom = getUser(socket.id)?.room;

    if (prevRoom) {
      socket.leave(prevRoom);
      io.to(prevRoom).emit(
        "message",
        buildMsg(ADMIN, `${name} has left the room`),
      );
    }

    const user = activeUser(socket.id, name, room);

    if (prevRoom) {
      io.to(prevRoom).emit("userList", {
        users: getUsersInRoom(prevRoom),
      });
    }

    socket.join(user.room);

    socket.emit(
      "message",
      buildMsg(ADMIN, `You have joined the ${user.room} chat room`),
    );

    socket.broadcast
      .to(room)
      .emit("message", buildMsg(ADMIN, `${user.name} has joined the room`));

    io.to(room).emit("userList", { users: getUsersInRoom(room) });

    io.emit("roomList", { rooms: getAllActiveRooms() });
    console.log(UserState.users);
  });

  socket.on("leaveRoom", () => {
    console.log("Leave Room");
    const user = getUser(socket.id);
    if (user?.room) {
      userLeaveApp(socket.id);
      socket.leave(user.room);
      socket.broadcast
        .to(user.room)
        .emit("message", buildMsg(ADMIN, `${user.name} has left the room`));
      io.to(user.room).emit("userList", { users: getUsersInRoom(user.room) });
      io.emit("roomList", { rooms: getAllActiveRooms() });
    }
  });

  socket.on("disconnect", () => {
    const user = getUser(socket.id);
    userLeaveApp(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        buildMsg(ADMIN, `${user.name} has left the room`),
      );

      io.to(user.room).emit("userList", {
        users: getUsersInRoom(user.room),
      });

      io.to("roomList", () => ({ rooms: getAllActiveRooms() }));
      socket.leave(user.room);
    }
    console.log(`User ${socket.id} disconnected`);
  });

  socket.on("message", ({ name, text }) => {
    console.log(UserState.users);
    console.log(name, text);
    const room = getUser(socket.id)?.room;
    console.log(room);
    if (room) {
      io.to(room).emit("message", buildMsg(name, text));
    }
  });

  socket.on("activity", (name) => {
    const room = getUser(socket.id)?.room;
    if (room) {
      socket.broadcast.to(room).emit("activity", name);
    }
  });
});

function buildMsg(name, text) {
  return {
    name,
    text,
    time: new Intl.DateTimeFormat("default", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(new Date()),
  };
}

function activeUser(id, name, room) {
  const user = { id, name, room };
  UserState.setUsers([
    ...UserState.users.filter((user) => user.id !== id),
    user,
  ]);
  return user;
}

function userLeaveApp(id) {
  UserState.setUsers([...UserState.users.filter((user) => user.id !== id)]);
}

function getUser(id) {
  return UserState.users.find((user) => user.id === id);
}

function getUsersInRoom(room) {
  return UserState.users.filter((user) => user.room === room);
}

function getAllActiveRooms() {
  return (
    Array.from(new Set(UserState.users.map((user) => user.room) || [])) || []
  );
}
