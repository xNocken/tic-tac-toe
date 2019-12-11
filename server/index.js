/* eslint-disable no-console */
/* eslint-disable no-unreachable */

const fs = require('fs');
let gSocket;

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

const endGame = (winner, bot = false, draw = false) => {
  let message = bot ? 'Bot' : config.settings[`player${winner}`];
  if (draw) { message = 'draw'; }
  gSocket.emit('winner', { message: message });
};

const fieldClick = (x, y) => {
  const { isPlayer1, clicked, maxFields } = config.settings;

  if (config.settings.fields[x][y] !== 0) {
    return;
  }

  const infos = isPlayer1 ? 1 : 2;

  config.settings.fields[x][y] = infos;
  config.setSetting('clicked', clicked + 1);
  config.setSetting('isPlayer1', !isPlayer1);

  const gameRunnig = clicked + 1 !== maxFields;
  config.setSetting('gameRunning', gameRunnig);
};

const startGame = (length, player1, player2) => {
  const field = Array.from({ length })
    .map(() => Array.from({ length })
      .map(() => 0));

  config.setSetting('fields', field);
  config.setSetting('length', length);
  config.setSetting('clicked', 0);
  config.setSetting('player1', player1);
  config.setSetting('player2', player2);
  config.setSetting('isPlayer1', true);
};

io.on('connection', (socket) => {
  gSocket = socket;
  socket.on('click', (data) => {
    fieldClick(data.x, data.y);
    const winner = checkWinner();

    if (winner) {
      endGame(winner);
    }
  });

  socket.on('startgame', (data) => {
    console.log(data);
    startGame(data.length, data.player1, data.player2);
  });

  socket.on('click', (data) => {
    fieldClick(data.x, data.y);
    const winner = checkWinner();

    console.log(config.settings.fields);

    if (winner) {
      endGame(winner);
    }
  });
});
