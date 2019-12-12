const settings = {
  botDelay: 100,
  ip: '172.17.2.156',
  port: 8080,
};

const getSetting = setting => settings[setting];

const setSetting = (setting, value) => {
  settings[setting] = value;
};

const setSettings = (theSettings) => {
  Object
    .entries(theSettings)
    .forEach(setting => setSetting(setting[0], setting[1]));
};

export default {
  getSetting,
  setSetting,
  setSettings,
  settings,
};
