/* eslint-disable no-console */
/* eslint-disable no-alert */
import $ from 'jquery';
import io from 'socket.io-client';
import config from './config';

let socket;

const checkWinner = (fields) => {
  const points = fields.map(item => item.map(elem => elem.data('info').player || 0));
  const rowLength = parseInt(config.settings.fields, 10);
  let winner = 0;

  const strings = Array.from({ length: 2 }).map(() => '');

  for (let o = 0; o < rowLength; o += 1) {
    let string1 = '';
    let string2 = '';
    strings[0] += points[o][o];
    strings[1] += points[o][(points.length - 1) - o];

    for (let i = 0; i < rowLength; i += 1) {
      string1 += points[o][i];
      string2 += points[i][o];
    }
    strings.push(string1);
    strings.push(string2);
  }

  strings.forEach((string) => {
    if (string === '1'.repeat(rowLength)) {
      winner = 1;
    }

    if (string === '2'.repeat(rowLength)) {
      winner = 2;
    }
  });

  return winner;
};

const endGame = (winner, bot = false, draw = false) => {
  let message = bot ? 'Bot' : config.settings[`player${winner}`];
  if (draw) { message = 'draw'; }

  alert(message);

  if (socket) {
    socket.disconnect();
    socket = undefined;
  }

  $('.field').unbind('click');
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

  if (config.settings.mode === 3) {
    socket.emit('click', { x: infos.x, y: infos.y });
  }
};

const createSocket = () => {
  socket = io('ws://172.17.2.156:8080');

  socket.on('connect', () => {
    console.log('Connected to: ws://172.17.2.156:8080');
  });

  socket.on('winner', (data) => {
    endGame(data.message);
  });

  socket.emit('startgame', { length: config.settings.fields, player1: config.settings.player1, player2: config.settings.player2 });
};

const player2Bot = (fields, isPlayer1 = false) => {
  let x = Math.floor(Math.random() * (config.settings.fields - 1));
  let y = Math.floor(Math.random() * (config.settings.fields - 1));

  while (fields[x][y].data('info').player !== 0 && config.settings.gameRunning) {
    x = Math.floor(Math.random() * config.settings.fields);
    y = Math.floor(Math.random() * config.settings.fields);
  }

  if (config.settings.gameRunning) { fieldClick(fields[x][y], isPlayer1); }
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
    config.setSetting('mode', parseInt(target[3].value, 10));
    config.setSetting('maxFields', parseInt(target[2].value, 10) * parseInt(target[2].value, 10));

    if (config.settings.mode === 3) {
      createSocket();
    }

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

          if (checkWinner(fields) !== 0 && config.settings.mode !== 3) {
            endGame(checkWinner(fields));
            return;
          }

          if (!config.settings.gameRunning) {
            endGame('', false, true);
          }

          if (parseInt(config.settings.mode, 10) !== 1) {
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
