import $ from 'jquery';
import config from './config';

const checkWinner = (fields) => {
  const points = fields.map(item => item.map(elem => elem.data('info').player || 0));
  global.points = points;
  const rowLength = parseInt(config.settings.fields, 10);

  let countPlayer1 = 0;
  let countPlayer2 = 0;
  let winner = 0;
  const StringsToCheck = [];

  for (let o = 0; o < rowLength; o += 1) {
    let string1Player2 = '';
    let string2Player2 = '';
    let string3Player2 = '';
    let string4Player2 = '';

    let string1Player1 = '';
    let string2Player1 = '';
    let string3Player1 = '';
    let string4Player1 = '';


    for (let i = 0; i < rowLength; i += 1) {
      if (points[o][o]) {
        if (points[o][i] === 1
          || points[i][i] === 1
          || points[i][o] === 1
          || points[i][(points.length - 1) - i] === 1) {
          if (points[o][i] !== 1) {
            stringPlayer1 += points[o][i];
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
        if (points[o][i] === 2 || points[i][i] === 2
          || points[i][o] === 2 || points[i][(points.length - 1) - i] === 2) {
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

const endGame = (winner, bot = false, draw = false) => {
  let message = bot ? 'Bot' : config.settings[`player${winner}`];
  if (draw) { message = 'draw'; }
  alert(message);
  $('div').unbind('click');
};

const fieldClick = ($element, isPlayer1) => {
  const infos = $element.data('info');

  $element.addClass(`field--clicked-player${isPlayer1 ? 1 : 2}`);

  infos.clicked = true;
  infos.player = isPlayer1 ? 1 : 2;
  $element.data('info', infos);

  config.setSetting('clicked', config.settings.clicked + 1);

  const gameRunnig = config.settings.clicked !== config.settings.maxFields;
  config.setSetting('gameRunning', gameRunnig);
};

const player2Bot = (fields) => {
  let x = Math.floor(Math.random() * (config.settings.fields - 1));
  let y = Math.floor(Math.random() * (config.settings.fields - 1));

  while (fields[x][y].data('info').player !== 0 && config.settings.gameRunning) {
    x = Math.floor(Math.random() * config.settings.fields);
    y = Math.floor(Math.random() * config.settings.fields);
  }

  if (config.settings.gameRunning) { fieldClick(fields[x][y], false); }
};

export default () => {
  $('#start-form').on('submit', (event) => {
    event.preventDefault();

    let inputBlocked = false;
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
        element.on('click', () => {
          if (inputBlocked || element.data('info').clicked) {
            return;
          }

          fieldClick(element, isPlayer1);
          isPlayer1 = !isPlayer1;

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
            inputBlocked = false;

            if (checkWinner(fields) !== 0) {
              endGame(checkWinner(fields), true);
            }
          }, config.settings.botDelay);

          inputBlocked = true;
          isPlayer1 = !isPlayer1;
        });
        row.append(element);
      });

      $('#fields').append(row);
    });
  });
};
