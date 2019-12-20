import $ from 'jquery';

import config from '../config';
import {
  fieldClick,
  endGame,
  checkWinner,
  botMove,
} from './logic';

const clicker = (element, fields) => {
  if (config.settings.inputBlocked || element.data('info').clicked) {
    return;
  }

  fieldClick(element, config.settings.isPlayer1);
  config.setSetting('isPlayer1', !config.settings.isPlayer1);

  let winner = checkWinner(fields);

  if (winner !== 0) {
    endGame(winner);

    return;
  }

  if (!config.settings.gameRunning) {
    endGame('', false, true);
  }

  if (config.settings.mode === '2') {
    return;
  }

  setTimeout(() => {
    botMove(fields);
    config.setSetting('inputBlocked', false);

    winner = checkWinner(fields);

    if (winner !== 0) {
      endGame(winner, true);
    }
  }, config.settings.botDelay);

  config.setSettings({
    inputBlocked: true,
    isPlayer1: !config.settings.isPlayer1,
  });
};

export default () => {
  $(document).on('checkWinner', (event, items) => checkWinner(items.fields, items.points));
  const length = config.settings.fields;

  const fields = Array.from({ length })
    .map((_, xIndex) => Array.from({ length })
      .map((__, yIndex) => {
        const element = $('<div class="field"></div>');

        element.data('info', {
          x: xIndex,
          y: yIndex,
          clicked: false,
          player: '0',
        });

        return element;
      }));

  $('#fields').empty();

  fields.forEach((row) => {
    const $row = $('<div class="row"></div>');

    row.forEach(($field) => {
      $field.on('click', () => clicker($field, fields));

      $row.append($field);
    });

    $('#fields').append($row);
  });
};
