const config = require('./config');

const checkWinner = () => {
  const points = config.settings.fields;
  const rowLength = parseInt(config.settings.fields.length, 10);
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

const fieldClick = (x, y, name) => {
  const { isPlayer1, clicked, maxFields } = config.settings;

  if (config.settings.fields[x][y] !== 0) {
    return;
  }

  config.sockets.io.sockets.emit('fieldClick', { player: isPlayer1 ? 1 : 2, x, y });
  config.sockets.io.sockets.emit('updateStatus', { message: `Next player: ${name}` });

  const infos = isPlayer1 ? 1 : 2;

  config.settings.fields[x][y] = infos;
  config.setSetting('clicked', clicked + 1);
  config.setSetting('isPlayer1', !isPlayer1);

  const gameRunnig = clicked + 1 !== maxFields;
  config.setSetting('gameRunning', gameRunnig);
};

const endGame = (winner, draw = false, left = false) => {
  config.setSetting('gameRunning', false);
  let message;

  if (winner) { message = config.settings.sessions[`player${winner}`].name; }
  if (draw) { message = 'its a draw'; }
  if (left) { message = 'player left'; }
  config.sockets.io.sockets.emit('updateStatus', { message: `${message || 'Unnamed'} won` });
};

const startGame = (length) => {
  const field = Array.from({ length })
    .map(() => Array.from({ length })
      .map(() => 0));

  config.setSetting('fields', field);
  config.setSetting('clicked', 0);
  config.setSetting('isPlayer1', true);
  config.setSetting('gameRunning', true);

  config.sockets.io.sockets.emit('generatefields', { length });

  const player1 = Math.floor(Math.random() * (config.settings.players.length));
  let player2 = Math.floor(Math.random() * (config.settings.players.length));
  while (player2 === player1) {
    player2 = Math.floor(Math.random() * (config.settings.players.length));
  }


  config.settings.sessions.player1 = config.settings.players[player1];
  config.settings.sessions.player2 = config.settings.players[player2];

  config.sockets.io.sockets.emit('updateStatus', { message: `Next player: ${config.settings.sessions.player1.name || 'Unnamed'}` });
};

module.exports = {
  startGame,
  endGame,
  fieldClick,
  checkWinner,
};
