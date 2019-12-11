const settings = {
  botDelay: 100,
};

const getSetting = setting => settings[setting];

const setSetting = (setting, value) => {
  settings[setting] = value;
};

module.exports = {
  getSetting,
  setSetting,
  settings,
};
