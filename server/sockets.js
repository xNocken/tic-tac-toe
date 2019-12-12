const config = require('./config');
const logic = require('./logic');

module.exports = (io) => {
  io.on('connection', (socket) => {
    // eslint-disable-next-line no-console
    console.log(socket.id, 'Joined');
    config.settings.players.push({ id: socket.id });

    socket.on('click', (data) => {
      if (config.settings.sessions[`player${config.settings.isPlayer1 ? 1 : 2}`].id !== socket.id) {
        return;
      }

      const { sessions } = config.settings;

      const name = sessions.player1.id !== socket.id
        ? sessions.player1.name : sessions.player2.name;

      logic.fieldClick(data.x, data.y, name);
      const winner = logic.checkWinner();

      if (winner) {
        logic.endGame(winner);
      }

      if (config.settings.clicked === config.settings.length * config.settings.length) {
        logic.endGame(0, true);
      }
    });

    socket.on('startgame', (data) => {
      if (data.player1.length > 30) {
        socket.emit('rejected', { message: 'name length must be between 0 and 30' });
        socket.disconnect();
      }
      config.settings.players.forEach((player, index) => {
        if (player.id === socket.id) {
          config.settings.players[index].name = logic.escapeString(data.player1);
        }
      });

      config.setSetting('length', data.length);
      if (config.settings.gameRunning) {
        socket.emit('spectate', { fields: config.settings.fields });
        io.sockets.emit('updateStatus', { message: `${data.player1} joined as spectator` });
        return;
      }

      global.sessions = config.settings.sessions;
      if (config.settings.players.length >= 2) {
        config.resetSettings();
        logic.startGame(data.length);
      } else {
        socket.emit('updateStatus', { message: 'waiting for players' });
      }
    });

    socket.on('disconnect', () => {
    // eslint-disable-next-line no-console
      console.log(socket.id, 'left');
      if (config.settings.players.length === 0) {
        return;
      }

      config.settings.players.forEach((player, index) => {
        if (player.id === socket.id) {
          config.settings.players.splice(index, 1);
        }

        if (config.settings.sessions.player1.id === socket.id) {
          logic.endGame(0, false, true);
        }

        if (config.settings.sessions.player2.id === socket.id) {
          logic.endGame(0, false, true);
        }
      });

      global.sessions = config.settings.sessions;
    });
  });
};
