const globalSettings = {
  players: [],
  sessions: [],
  ip: '172.17.2.156',
  port: 8080,
};

const settings = {

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
  globalSettings,
};
