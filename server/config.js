const globals = require('../globalconfig');

const globalSettings = {
  players: [],
  sessions: [],
  ...globals,
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
