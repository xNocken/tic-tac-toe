/* eslint no-underscore-dangle: ["error", { "allow": ["_query"] }] */
/* eslint-disable no-param-reassign */
const config = require('./config');
const logic = require('./logic');

global.config = config;
module.exports = (io) => {
  io.on('connection', (socket) => {
    const username = socket.request._query.name;
    const nameLength = username.length;

    socket.leave(socket.id);
    if (nameLength < 5 || nameLength > 20) {
      socket.emit('rejected', { message: 'Your name is too long or too short' });
      return;
    }

    socket.username = logic.escapeString(username);

    if (socket.request._query.sessionId) {
      socket.sessionId = socket.request._query.sessionId;
    } else {
      Object.entries(io.sockets.adapter.rooms).forEach((currentRoom) => {
        if (currentRoom[1].length < 2) {
          [socket.sessionId] = currentRoom;
        }
      });

      if (!socket.sessionId) {
        socket.sessionId = socket.id;
      }
    }

    socket.join(socket.sessionId);
    socket.emit('updateStatus', { message: 'Conected to server. Press start to start a game' });
    const room = io.sockets.adapter.rooms[socket.sessionId];

    const userLimit = config.globalSettings.maxUsersPerSession;

    if (room.length > userLimit && userLimit !== -1) {
      socket.emit('rejected', { message: `The lobby is currently full. limit is ${userLimit}` });
      socket.disconnect();
      return;
    }

    if (room.gameRunning) {
      io.to(socket.sessionId).emit('spectate', { fields: room.fields });
    }
    io.to(socket.sessionId).emit('updateStatus', { message: `${socket.username} joined` });

    console.log(socket.username, 'Joined', socket.sessionId);

    socket.on('disconnect', () => {
      io.to(socket.sessionId).emit('updateStatus', { message: `${socket.username} left.` });

      console.log(`${socket.username} left ${socket.sessionId}`);

      if (room && room.gameRunning) {
        logic.endGame(io, socket.sessionId, 0, false, true);
      }
    });

    socket.on('startgame', (data) => {
      const fieldLength = data.length;
      const { length } = room;

      if (length < 2) {
        socket.emit('updateStatus', { message: 'Waiting for players' });
        return;
      }

      logic.startGame(fieldLength, socket.sessionId, io);
    });

    socket.on('click', (data) => {
      const { x, y } = data;
      const activePlayer = room.isPlayer1 ? 0 : 1;

      if (room.currentPlayers[activePlayer] === socket.id) {
        logic.fieldClick(io, socket.sessionId, x, y, socket.username);
        const winner = logic.checkWinner(io, socket.sessionId);

        if (winner) {
          logic.endGame(io, socket.sessionId, winner);
        }

        if (room.clicked === room.fields.length ** 2) {
          logic.endGame(io, socket.sessionId, 0, true);
        }
      }
    });
  });
};
