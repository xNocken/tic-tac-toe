const settings = {
  botDelay: 100,
};

const getSetting = setting => settings[setting];

const setSetting = (setting, value) => {
  settings[setting] = value;
};

export default {
  getSetting,
  setSetting,
  settings,
};
