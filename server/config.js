const settings = {
  botDelay: 100,
  players: [],
  sessions: {},
};

const sockets = {

};

const getSetting = setting => settings[setting];

const setSetting = (setting, value) => {
  settings[setting] = value;
};

const setSocket = (setting, value) => {
  sockets[setting] = value;
};

module.exports = {
  getSetting,
  setSetting,
  settings,
  sockets,
  setSocket,
};
