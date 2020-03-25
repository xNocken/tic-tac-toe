/* eslint-disable no-param-reassign */

const checkWinner = (io, sessionId) => {
  const points = io.sockets.adapter.rooms[sessionId].fields;
  const rowLength = parseInt(io.sockets.adapter.rooms[sessionId].fields.length, 10);
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
  const activePlayer = io.sockets.adapter.rooms[sessionId].isPlayer1 ? 1 : 0;
  const nextPlayerId = io.sockets.adapter.rooms[sessionId].players[activePlayer];

  const { isPlayer1, clicked, maxFields } = io.sockets.adapter.rooms[sessionId];

  if (io.sockets.adapter.rooms[sessionId].fields[x][y] !== 0) {
    return;
  }

  io.to(sessionId).emit('fieldClick', { player: isPlayer1 ? 1 : 2, x, y });
  io.to(sessionId).emit('updateStatus', { message: `Next player: ${io.sockets.connected[nextPlayerId].username || 'Unnamed'}` });

  const infos = isPlayer1 ? 1 : 2;

  io.sockets.adapter.rooms[sessionId].fields[x][y] = infos;
  io.sockets.adapter.rooms[sessionId].clicked = clicked + 1;
  io.sockets.adapter.rooms[sessionId].isPlayer1 = !isPlayer1;

  const gameRunnig = clicked + 1 !== maxFields;
  io.sockets.adapter.rooms[sessionId].gameRunning = gameRunnig;
};

const endGame = (io, sessionId, winner, draw = false, left = false) => {
  const winnerId = io.sockets.adapter.rooms[sessionId].players[winner - 1];

  let message;

  if (winner) { message = `${io.sockets.connected[winnerId].username || 'Unnamed'} won`; }
  if (draw) { message = 'its a draw'; }
  if (left) { message = 'Game ended: Player left'; }

  io.to(sessionId).emit('updateStatus', { message });
  io.to(sessionId).emit('winning');
};

const startGame = (length, sessionId, io) => {
  const field = Array.from({ length: parseInt(length, 10) })
    .map(() => Array.from({ length: parseInt(length, 10) })
      .map(() => 0));

  io.sockets.adapter.rooms[sessionId].fields = field;
  io.sockets.adapter.rooms[sessionId].clicked = 0;
  io.sockets.adapter.rooms[sessionId].isPlayer1 = Math.round(Math.random());
  io.sockets.adapter.rooms[sessionId].gameRunning = true;

  const activePlayer = io.sockets.adapter.rooms[sessionId].isPlayer1 ? 0 : 1;
  const nextPlayerId = io.sockets.adapter.rooms[sessionId].players[activePlayer];

  io.to(sessionId).emit('generatefields', { length });
  io.to(sessionId).emit('updateStatus', { message: `Next player: ${io.sockets.connected[nextPlayerId].username}` });
};

module.exports = {
  startGame,
  endGame,
  fieldClick,
  checkWinner,
  escapeString,
};
