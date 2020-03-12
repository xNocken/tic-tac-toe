import $ from 'jquery';

// eslint-disable-next-line
import { minimax, simpleBot } from './bots';
import config from '../config';

export const checkWinner = (fields, pointsArray) => {
  let points;
  if (fields) {
    points = fields.map(item => item.map(elem => elem.data('info').player || 0));
  } else {
    points = pointsArray;
  }
  const rowLength = parseInt(config.settings.fields, 10);

  let player1WinCondition = '';
  let player2WinCondition = '';

  if (config.lastLength === rowLength) {
    ({ player1WinCondition, player2WinCondition } = config);
  } else {
    player1WinCondition = '1'.repeat(rowLength);
    player2WinCondition = '2'.repeat(rowLength);
    config.player1WinCondition = player1WinCondition;
    config.player2WinCondition = player2WinCondition;
    config.lastLength = rowLength;
  }

  const strings = [];
  let winner = 0;

  for (let o = 0; o < rowLength; o += 1) {
    let string1 = '';
    let string2 = '';

    const pointso = points[o];

    strings.push(pointso[o]);
    strings.push(pointso[(points.length - 1) - o]);

    for (let i = 0; i < rowLength; i += 1) {
      string1 += pointso[i];
      string2 += points[i][o];
    }

    strings.push(string1);
    strings.push(string2);
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
    isPlayer1: !isPlayer1,
  });
};


export const botMove = (fields) => {
  let move;
  const { botMode } = config.settings;

  const points = fields.map(item => item.map($elem => $elem.data('info').player || 0));
  if (botMode === 'minimax') {
    move = minimax(points, config.setSetting.isPlayer1);
  } else if (botMode === 'simple') {
    move = simpleBot(points, config.setSetting.isPlayer1 ? 1 : 2);
  } else {
    console.error('invalid bot selected');
    return;
  }
  fieldClick(fields[move.position.x][move.position.y], config.settings.isPlayer1);
};
