const http = require('http');
const config = require('./config');

const startGame = (fields) => {

};

const server = http.createServer((req, res) => {
  console.log(req.url);
  const data = [];
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.statusCode = 204;
  req.on('data', (chunk) => {
    data.push(chunk);
  });
  req.on('end', () => {
    console.log(JSON.parse(data).field);
  });
  res.end();
}).listen(8080, '172.17.2.156');

// const server = http.createServer((req, res) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.write('Hello World!');
//   console.log(req.connection.remoteAddress);
//   console.log(req.url);
//   let data = {};

//   req.on('data', (chunk) => {
//     data = parseDataChunk(`${chunk}`);
//     console.log(data);
//   });
//   res.end();
// }).listen(8080, '172.17.2.156');

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
};

const fieldClick = (x, y, isPlayer1) => {
  const infos = config.settings.fields[x][y];

  infos.clicked = true;
  infos.player = isPlayer1 ? 1 : 2;

  config.settings.fields[x][y] = infos;
  config.setSetting('clicked', config.settings.clicked + 1);
  const gameRunnig = config.settings.clicked !== config.settings.maxFields;
  config.setSetting('gameRunning', gameRunnig);
};
