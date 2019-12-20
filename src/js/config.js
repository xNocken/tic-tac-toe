import globals from '../../globalconfig';

const settings = {
  botDelay: 0,
  botMode: 'minimax',
  ...globals,
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
