/* eslint-disable no-console */
/* eslint-disable no-unreachable */
const fs = require('fs');

const sessions = {};
const players = [];

const handler = (req, res) => {
  fs.readFile(`${__dirname}/..${req.url === '/' ? '/index.html' : req.url}`,
    (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end(`Error loading ${req.url}`);
      }

      res.writeHead(200);
      res.end(data);
      return '';
    });
};

const app = require('http').createServer(handler);
const io = require('socket.io')(app);
const config = require('./config');

app.listen(8080, '172.17.2.156');

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

const endGame = (winner, draw = false) => {
  config.setSetting('gameRunning', false);
  let message = config.settings[`player${winner}`];
  if (draw) { message = 'its a draw'; }
  io.sockets.emit('winner', { message: message || 'Unnamed' });
};

const fieldClick = (x, y) => {
  const { isPlayer1, clicked, maxFields } = config.settings;

  if (config.settings.fields[x][y] !== 0) {
    return;
  }

  io.sockets.emit('fieldClick', { player: isPlayer1 ? 1 : 2, x, y });

  const infos = isPlayer1 ? 1 : 2;

  config.settings.fields[x][y] = infos;
  config.setSetting('clicked', clicked + 1);
  config.setSetting('isPlayer1', !isPlayer1);

  const gameRunnig = clicked + 1 !== maxFields;
  config.setSetting('gameRunning', gameRunnig);
};

const startGame = (length) => {
  const field = Array.from({ length })
    .map(() => Array.from({ length })
      .map(() => 0));

  config.setSetting('fields', field);
  config.setSetting('clicked', 0);
  config.setSetting('isPlayer1', true);

  io.sockets.emit('generatefields', { length });

  const player1 = Math.floor(Math.random() * (players.length));
  let player2 = Math.floor(Math.random() * (players.length));
  while (player2 === player1) {
    player2 = Math.floor(Math.random() * (players.length));
  }

  sessions.player1 = players[player1];
  sessions.player2 = players[player2];
};

io.on('connection', (socket) => {
  console.log(socket.id, 'Joined');

  socket.on('click', (data) => {
    if (sessions[`player${config.settings.isPlayer1 ? 1 : 2}`].id !== socket.id) {
      return;
    }

    fieldClick(data.x, data.y);
    const winner = checkWinner();

    if (winner) {
      endGame(winner);
    }

    if (config.settings.clicked === config.settings.length * config.settings.length) {
      endGame(0, true);
    }
  });

  socket.on('startgame', (data) => {
    players.push({ id: socket.id, name: data.player1 });

    console.log(config.settings);
    if (config.settings.gameRunning) {
      socket.emit('spectate', { fields: config.settings.fields });
      return;
    }

    global.sessions = sessions;
    if (players.length >= 2) {
      startGame(data.length);
    }
  });

  socket.on('disconnect', () => {
    players.forEach((player, index) => {
      if (player.id === socket.id) {
        players.slice(index, 1);
      }
    });

    global.sessions = sessions;
    console.log(socket.id, 'left');
  });
});
