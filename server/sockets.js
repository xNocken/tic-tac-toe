/* eslint no-underscore-dangle: ["error", { "allow": ["_query"] }] */
/* eslint-disable no-param-reassign */
const config = require('./config');
const logic = require('./logic');

global.config = config;
module.exports = (io) => {
  io.on('connection', (socket) => {
    // eslint-disable-next-line no-console
    socket.username = socket.request._query.name;

    if (socket.request._query.sessionId) {
      socket.sessionId = socket.request._query.sessionId;
    } else {
      for (let i = 0; i < config.globalSettings.sessions.length; i += 1) {
        if (config.globalSettings.sessions[i].players < 2) {
          socket.sessionId = socket.id;
        }
      }
      config.globalSettings.sessions.push({ id: socket.sessionId, players: 0 });
    }

    socket.join(socket.sessionId);
    config.globalSettings.sessions.forEach((session, index) => {
      if (session.id === socket.sessionId) {
        config.globalSettings.sessions[index].players += 1;
      }
    });

    console.log(socket.id, 'Joined', socket.sessionId);

    socket.on('debug', () => {
      io.to(socket.sessionId).emit('generatefields', { length: 3 });
    });
  });
};
