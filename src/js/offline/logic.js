import $ from 'jquery';
import config from '../config';

export const checkWinner = (fields) => {
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

export const endGame = (winner, bot = false, draw = false) => {
  let message = bot ? 'Bot' : config.settings[`player${winner}`];
  if (draw) { message = 'draw'; }

  // eslint-disable-next-line
  alert(message);

  $('.field').unbind('click');
};

export const fieldClick = ($element, isPlayer1) => {
  const infos = $element.data('info');

  $element.addClass(`field--clicked-player${isPlayer1 ? 1 : 2}`);

  infos.clicked = true;
  infos.player = isPlayer1 ? 1 : 2;
  $element.data('info', infos);

  config.setSetting('clicked', config.settings.clicked + 1);

  const gameRunnig = config.settings.clicked !== config.settings.maxFields;
  config.setSetting('gameRunning', gameRunnig);
};

export const player2Bot = (fields, isPlayer1 = false) => {
  let x = Math.floor(Math.random() * (config.settings.fields - 1));
  let y = Math.floor(Math.random() * (config.settings.fields - 1));

  while (fields[x][y].data('info').player !== 0 && config.settings.gameRunning) {
    x = Math.floor(Math.random() * config.settings.fields);
    y = Math.floor(Math.random() * config.settings.fields);
  }

  if (config.settings.gameRunning) { fieldClick(fields[x][y], isPlayer1); }
};
