import $ from 'jquery';

import config from '../config';

export const checkWinner = (fields) => {
  const points = fields.map(item => item.map(elem => elem.data('info').player || 0));
  const rowLength = parseInt(config.settings.fields, 10);
  const player1WinCondition = '1'.repeat(rowLength);
  const player2WinCondition = '2'.repeat(rowLength);
  const strings = ['', ''];
  let winner = 0;

  for (let o = 0; o < rowLength; o += 1) {
    let string1 = '';
    let string2 = '';

    strings[0] += points[o][o];
    strings[1] += points[o][(points.length - 1) - o];

    for (let i = 0; i < rowLength; i += 1) {
      string1 += points[o][i];
      string2 += points[i][o];
    }

    strings.push(string1, string2);
  }

  strings.forEach((string) => {
    if (string === player1WinCondition) {
      winner = 1;
    }

    if (string === player2WinCondition) {
      winner = 2;
    }
  });

  return winner;
};

export const endGame = (winner, bot, draw) => {
  const message = bot ? 'Bot' : config.settings[`player${winner}`];

  // 🤔
  // eslint-disable-next-line
  alert(draw ? 'draw' : message);

  $('.field').unbind('click');
};

export const fieldClick = ($element, isPlayer1) => {
  const infos = $element.data('info');
  const gameRunning = config.settings.clicked !== config.settings.maxFields;

  $element.addClass(`field--clicked-player${isPlayer1 ? 1 : 2}`);

  infos.clicked = true;
  infos.player = isPlayer1 ? 1 : 2;
  $element.data('info', infos);

  config.setSettings({
    clicked: config.settings.clicked + 1,
    gameRunning,
  });
};

const getRandomPosition = (offset = 0) => Math.floor(
  Math.random() * (config.settings.fields - offset),
);

export const player2Bot = (fields, isPlayer1 = false) => {
  const { gameRunning } = config.settings;

  let x = getRandomPosition(1);
  let y = getRandomPosition(1);

  while (fields[x][y].data('info').player !== 0 && gameRunning) {
    x = getRandomPosition();
    y = getRandomPosition();
  }

  if (gameRunning) {
    fieldClick(fields[x][y], isPlayer1);
  }
};
