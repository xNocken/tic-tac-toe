let settings = {
  botDelay: 100,
  players: [],
  sessions: { player1: {}, player2: {} },
  ip: '172.17.2.156',
  port: 8080,
};

const unchanged = settings;

const sockets = {

};

const getSetting = setting => settings[setting];

const setSetting = (setting, value) => {
  settings[setting] = value;
};

const setSocket = (setting, value) => {
  sockets[setting] = value;
};

const resetSettings = () => {
  const { players } = settings;
  settings = unchanged;
  settings.players = players;
};

module.exports = {
  getSetting,
  setSetting,
  settings,
  sockets,
  setSocket,
  resetSettings,
};
