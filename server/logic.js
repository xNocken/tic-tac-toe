/* eslint-disable no-param-reassign */

const checkWinner = (io, sessionId) => {
  const room = io.sockets.adapter.rooms[sessionId];
  const points = room.fields;
  const rowLength = parseInt(room.fields.length, 10);
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

const escapeString = string => string
  .replace(/</g, '&lt')
  .replace(/>/g, '&gt')
  .replace(/"/g, '&quot');

const fieldClick = (io, sessionId, x, y) => {
  const room = io.sockets.adapter.rooms[sessionId];
  if (!room.gameRunning) {
    return;
  }

  const activePlayer = room.isPlayer1 ? 1 : 0;
  const nextPlayerId = room.currentPlayers[activePlayer];

  const { isPlayer1, clicked, maxFields } = room;

  if (room.fields[x][y] !== 0) {
    return;
  }

  io.to(sessionId).emit('fieldClick', { player: isPlayer1 ? 1 : 2, x, y });
  io.to(sessionId).emit('updateStatus', { message: `Next player: ${io.sockets.connected[nextPlayerId].username || 'Unnamed'}` });

  const infos = isPlayer1 ? 1 : 2;

  room.fields[x][y] = infos;
  room.clicked = clicked + 1;
  room.isPlayer1 = !isPlayer1;

  const gameRunnig = clicked + 1 !== maxFields;
  room.gameRunning = gameRunnig;
};

const endGame = (io, sessionId, winner, draw = false, left = false) => {
  const room = io.sockets.adapter.rooms[sessionId];
  const winnerId = room.currentPlayers[winner - 1];

  room.gameRunning = false;

  let message;

  if (!draw && !left) {
    io.sockets.connected[winnerId].wins += 1;
  }

  if (winner) { message = `${io.sockets.connected[winnerId].username || 'Unnamed'} won`; }
  if (draw) { message = 'its a draw'; }
  if (left) { message = 'Game ended: Player left'; }

  io.to(sessionId).emit('updateStatus', { message });
  io.to(sessionId).emit('winning');
};

const updatePlayerList = (io, sessionId) => {
  const room = io.sockets.adapter.rooms[sessionId];
  const users = [];

  if (!room) {
    return;
  }

  Object.keys(room.sockets).forEach((user) => {
    users.push({
      username: io.sockets.connected[user].username,
      wins: io.sockets.connected[user].wins,
    });
  });

  io.to(sessionId).emit('updatePlayers', users);
};

const startGame = (length, sessionId, io) => {
  const room = io.sockets.adapter.rooms[sessionId];
  const field = Array.from({ length: parseInt(length, 10) })
    .map(() => Array.from({ length: parseInt(length, 10) })
      .map(() => 0));
  const rooms = Object.keys(room.sockets);
  const currentPlayers = [];

  currentPlayers[0] = rooms[Math.floor(Math.random() * rooms.length)];

  do {
    currentPlayers[1] = rooms[Math.floor(Math.random() * rooms.length)];
  } while (currentPlayers[0] === currentPlayers[1]);

  room.fields = field;
  room.clicked = 0;
  room.isPlayer1 = Math.round(Math.random());
  room.gameRunning = true;
  room.currentPlayers = currentPlayers;

  const activePlayer = room.isPlayer1 ? 0 : 1;
  const nextPlayerId = currentPlayers[activePlayer];

  io.to(sessionId).emit('generatefields', { length });
  io.to(sessionId).emit('updateStatus', { message: `Next player: ${io.sockets.connected[nextPlayerId].username}` });
};

module.exports = {
  startGame,
  endGame,
  fieldClick,
  checkWinner,
  escapeString,
  updatePlayerList,
};
