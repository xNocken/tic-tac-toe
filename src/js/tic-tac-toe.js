import $ from 'jquery';
import config from './config';

const getObjectFromSerializeString = string => string.split('&')
  .map((item) => {
    const splitItem = item.split('=');
    return splitItem[1];
  });

const checkWinner = (fields) => {
  const points = fields.map(item => item.map(elem => elem.data('info').player || 0));
  const rowLength = parseInt(config.settings.fields, 10);

  let countPlayer1 = 0;
  let countPlayer2 = 0;
  let winner = 0;

  for (let o = 0; o < rowLength; o += 1) {
    countPlayer1 = 0;
    countPlayer2 = 0;

    let player1Down = true;
    let player1Diag = true;
    let player1Left = true;

    let player2Down = true;
    let player2Diag = true;
    let player2Left = true;

    for (let i = 0; i < rowLength; i += 1) {
      if (points[o][o]) {
        if (points[o][i] === 1 || points[i][i] === 1 || points[i][o] === 1) {
          if (points[o][i] !== 1) {
            player1Down = false;
          }
          if (points[i][i] !== 1) {
            player1Diag = false;
          }
          if (points[i][o] !== 1) {
            player1Left = false;
          }

          if (player1Left || player1Diag || player1Down) {
            countPlayer1 += 1;
          }
        }

        if (points[o][i] === 2 || points[i][i] === 2 || points[i][o] === 2) {
          if (points[o][i] !== 2) {
            player2Down = false;
          }
          if (points[i][i] !== 2) {
            player2Diag = false;
          }
          if (points[i][o] !== 2) {
            player2Left = false;
          }

          if (player2Left || player2Diag || player2Down) {
            countPlayer2 += 1;
          }
        }
        if (countPlayer1 === rowLength) {
          winner = 1;
        }

        if (countPlayer2 === rowLength) {
          winner = 2;
        }
      } else {
        countPlayer1 = 0;
        countPlayer2 = 0;
      }
    }
  }

  return winner;
};

const fieldClick = ($element, isPlayer1) => {
  const infos = $element.data('info');

  $element.addClass(`field--clicked-player${isPlayer1 ? 1 : 2}`);

  infos.clicked = true;
  infos.player = isPlayer1 ? 1 : 2;
  $element.data('info', infos);
};

export default () => {
  let isPlayer1 = true;

  $('#start-form').on('submit', (event) => {
    event.preventDefault();

    const h = getObjectFromSerializeString($(event.target).serialize());

    const gameSettings = {
      fields: h[1],
      name: h[0],
    };

    config.setSetting('player1', h[0]);
    config.setSetting('fields', h[1]);

    const length = gameSettings.fields;

    const fields = Array.from({ length })
      .map((item, xIndex) => Array.from({ length })
        .map((item2, yIndex) => {
          const element = $('<div class="field"></div>');

          element.data('info', { x: xIndex, y: yIndex, clicked: false });
          return element;
        }));

    $('#fields').empty();
    fields.forEach((item) => {
      const row = $('<div class="row"></div>');

      item.forEach((element) => {
        element.on('click', () => {
          if (!element.data('info').clicked) {
            fieldClick(element, isPlayer1);
            isPlayer1 = !isPlayer1;
            checkWinner(fields);
          }
        });
        row.append(element);
      });

      $('#fields').append(row);
    });
  });
};
