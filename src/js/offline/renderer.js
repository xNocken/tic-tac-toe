import $ from 'jquery';
import config from '../config';
import {
  fieldClick,
  endGame,
  checkWinner,
  player2Bot,
} from './logic';

const clicker = (element, fields) => {
  if (config.settings.inputBlocked || element.data('info').clicked) {
    return;
  }

  fieldClick(element, config.settings.isPlayer1);
  config.setSetting('isPlayer1', !config.settings.isPlayer1);

  if (checkWinner(fields) !== 0) {
    endGame(checkWinner(fields));
    return;
  }

  if (!config.settings.gameRunning) {
    endGame('', false, true);
  }

  if (parseInt(config.settings.mode, 10) === 2) {
    return;
  }

  setTimeout(() => {
    player2Bot(fields);
    config.setSetting('inputBlocked', false);

    if (checkWinner(fields) !== 0) {
      endGame(checkWinner(fields), true);
    }
  }, config.settings.botDelay);

  config.setSetting('inputBlocked', true);
  config.setSetting('isPlayer1', !config.settings.isPlayer1);
};

export default () => {
  const length = config.settings.fields;

  const fields = Array.from({ length })
    .map((_, xIndex) => Array.from({ length })
      .map((__, yIndex) => {
        const element = $('<div class="field"></div>');

        element.data('info', {
          x: xIndex,
          y: yIndex,
          clicked: false,
          player: 0,
        });
        return element;
      }));

  $('#fields').empty();
  fields.forEach((item) => {
    const row = $('<div class="row"></div>');

    item.forEach((element) => {
      element.on('click', () => clicker(element, fields));
      row.append(element);
    });

    $('#fields').append(row);
  });
};
