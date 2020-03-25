/* eslint no-underscore-dangle: ["error", { "allow": ["_query"] }] */
/* eslint-disable no-param-reassign */
const config = require('./config');
const logic = require('./logic');

global.config = config;
module.exports = (io) => {
  io.on('connection', (socket) => {

    console.log(socket.id)
    socket.username = logic.escapeString(socket.request._query.name);

    if (socket.request._query.sessionId) {
      socket.sessionId = socket.request._query.sessionId;
    } else {
      console.log(io.sockets.adapter.rooms)
      Object.entries(io.sockets.adapter.rooms).forEach((room) => {
        if (room.length < 2) {
          socket.sessionId = room.id;
        }
      });

      if (!socket.sessionId) {
        socket.sessionId = socket.id;
        io.sockets.adapter.rooms[socket.sessionId].players = [];
      }
    }

    socket.join(socket.sessionId);
    io.sockets.adapter.rooms[socket.sessionId].players.push(socket.id);
    socket.emit('updateStatus', { message: 'Conected to server. Press start to start a game' });
    io.to(socket.sessionId).emit('updateStatus', { message: `${socket.username} joined` });

    console.log(socket.username, 'Joined', socket.sessionId);

    socket.on('disconnect', () => {
      io.to(socket.sessionId).emit('updateStatus', { message: `${socket.username} left.` });

      console.log(`${socket.username} left ${socket.sessionId}`);
    });

    socket.on('startgame', (data) => {
      const fieldLength = data.length;
      const { length, gameRunning } = io.sockets.adapter.rooms[socket.sessionId];

      if (gameRunning && length > 2) {
        socket.emit('rejected', { message: 'Lobby is full' });
        return;
      }

      if (length < 2) {
        socket.emit('updateStatus', { message: 'Waiting for players' });
        return;
      }

      logic.startGame(fieldLength, socket.sessionId, io);
    });

    socket.on('click', (data) => {
      const { x, y } = data;
      const activePlayer = io.sockets.adapter.rooms[socket.sessionId].isPlayer1 ? 0 : 1;

      if (io.sockets.adapter.rooms[socket.sessionId].players[activePlayer] === socket.id) {
        logic.fieldClick(io, socket.sessionId, x, y, socket.username);
        const winner = logic.checkWinner(io, socket.sessionId);

        if (winner) {
          logic.endGame(io, socket.sessionId, winner);
        }
      }
    });
  });
};
