/* eslint no-underscore-dangle: ["error", { "allow": ["_query"] }] */
/* eslint-disable no-param-reassign */
const config = require('./config');
const logic = require('./logic');

global.config = config;
module.exports = (io) => {
  io.on('connection', (socket) => {
    socket.username = logic.escapeString(socket.request._query.name);

    if (socket.request._query.sessionId) {
      socket.sessionId = socket.request._query.sessionId;
    } else {
      for (let i = 0; i < config.globalSettings.sessions.length; i += 1) {
        if (config.globalSettings.sessions[i].players < 2) {
          socket.sessionId = config.globalSettings.sessions[i].id;
        }
      }

      if (!socket.sessionId) {
        socket.sessionId = socket.id;
        config.globalSettings.sessions.push({ id: socket.sessionId, players: 0 });
        io.sockets.adapter.rooms[socket.sessionId].players = [];
      }
    }

    socket.join(socket.sessionId);
    io.sockets.adapter.rooms[socket.sessionId].players.push(socket.id);
    socket.emit('updateStatus', { message: 'Conected to server. Press start to start a game' });
    io.to(socket.id).emit('updateStatus', { message: `${socket.username} joined` });

    config.globalSettings.sessions.forEach((session, index) => {
      if (session.id === socket.sessionId) {
        config.globalSettings.sessions[index].players += 1;
      }
    });

    // eslint-disable-next-line no-console
    console.log(socket.username, 'Joined', socket.sessionId);

    socket.on('disconnect', () => {
      io.to(socket.sessionId).emit('updateStatus', { message: `${socket.username} left.` });

      config.globalSettings.sessions.forEach((session, index) => {
        if (session.id === socket.sessionId) {
          config.globalSettings.sessions[index].players -= 1;

          if (config.globalSettings.sessions[index].players === 0) {
            config.globalSettings.sessions.splice(index, 1);
          }
        }
      });

      // eslint-disable-next-line no-console
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
