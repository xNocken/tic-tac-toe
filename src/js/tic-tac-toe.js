import $ from 'jquery';
import config from './config';

const checkWinner = (fields) => {
  const points = fields.map(item => item.map(elem => elem.data('info').player || 0));
  global.points = points;
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
    let player1BackDiag = true;

    let player2Down = true;
    let player2Diag = true;
    let player2Left = true;
    let player2BackDiag = true;

    for (let i = 0; i < rowLength; i += 1) {
      if (points[o][o]) {
        if (points[o][i] === 1
          || points[i][i] === 1
          || points[i][o] === 1
          || points[i][(points.length - 1) - i] === 1) {
          if (points[o][i] !== 1) {
            player1Down = false;
          }
          if (points[i][i] !== 1) {
            player1Diag = false;
          }
          if (points[i][o] !== 1) {
            player1Left = false;
          }
          if (points[i][(points.length - 1) - i] !== 1) {
            player1BackDiag = false;
          }

          if (player1Left || player1Diag || player1Down || player1BackDiag) {
            countPlayer1 += 1;
          }
        }
        if (points[o][i] === 2
          || points[i][i] === 2
          || points[i][o] === 2
          || points[i][(points.length - 1) - i] === 2) {
          if (points[o][i] !== 2) {
            player2Down = false;
          }
          if (points[i][i] !== 2) {
            player2Diag = false;
          }
          if (points[i][o] !== 2) {
            player2Left = false;
          }
          if (points[i][(points.length - 1) - i] !== 2) {
            player2BackDiag = false;
          }
          if (player2Left || player2Diag || player2Down || player2BackDiag) {
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

const endGame = (winner, bot = false) => {
  alert(bot ? 'Bot' : config.settings[`player${winner}`]);
  $('div').unbind('click');
};

const fieldClick = ($element, isPlayer1) => {
  const infos = $element.data('info');

  $element.addClass(`field--clicked-player${isPlayer1 ? 1 : 2}`);

  infos.clicked = true;
  infos.player = isPlayer1 ? 1 : 2;
  $element.data('info', infos);

  config.setSetting('clicked', config.settings.clicked + 1);
};

const player2Bot = (fields) => {
  let x = Math.floor(Math.random() * (config.settings.fields - 1));
  let y = Math.floor(Math.random() * (config.settings.fields - 1));
  const lastInput = config.settings.clicked !== config.settings.maxFields;

  while (fields[x][y].data('info').player !== 0 && lastInput) {
    x = Math.floor(Math.random() * config.settings.fields);
    y = Math.floor(Math.random() * config.settings.fields);
  }

  if (lastInput) { fieldClick(fields[x][y], false); }
};

export default () => {
  $('#start-form').on('submit', (event) => {
    event.preventDefault();

    let isPlayer1 = true;
    const { target } = event;
    config.setSetting('clicked', 0);
    config.setSetting('player1', target[0].value);
    config.setSetting('player2', target[1].value);
    config.setSetting('fields', target[2].value);
    config.setSetting('mode', target[3].value);
    config.setSetting('maxFields', parseInt(target[2].value, 10) * parseInt(target[2].value, 10));

    const length = config.settings.fields;

    const fields = Array.from({ length })
      .map((item, xIndex) => Array.from({ length })
        .map((item2, yIndex) => {
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
        element.on('click', () => {
          if (!element.data('info').clicked) {
            fieldClick(element, isPlayer1);
            isPlayer1 = !isPlayer1;
            if (checkWinner(fields) !== 0) {
              endGame(checkWinner(fields));
            } else if (parseInt(config.settings.mode, 10) === 1) {
              player2Bot(fields);
              isPlayer1 = !isPlayer1;

              if (checkWinner(fields) !== 0) {
                endGame(checkWinner(fields), true);
              }
            }
          }
        });
        row.append(element);
      });

      $('#fields').append(row);
    });
  });
};
