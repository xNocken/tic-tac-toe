const globals = require('../config');

if (!globals.ip || !globals.port) {
  console.error('You need to specify a ip and port in the config js and rebuild with webpack');
  process.exit();
}

const globalSettings = {
  players: [],
  https: false,
  cert: '',
  key: '',
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
