/* eslint-disable-next-line */ // ⊙.☉
import { checkWinner } from './logic';
import config from '../config';

const getEmptySpots = (fields) => {
  const emptySpots = [];
  for (let i = 0; i < fields.length; i += 1) {
    for (let o = 0; o < fields[i].length; o += 1) {
      const field = fields[i][o];

      if (field === '0' || field === undefined) {
        emptySpots.push({ x: i, y: o });
      }
    }
  }

  return emptySpots;
};

export const minimax = (fields, isPlayer1 = false, depth = 0) => {
  const newFields = fields;
  const currentPlayer = isPlayer1 ? 1 : 2;
  const emptySpots = getEmptySpots(fields);
  const moves = [];
  const winner = checkWinner(undefined, fields);

  if (winner === 1) {
    return -10;
  }
  if (winner === 2) {
    return 10;
  }
  if (emptySpots.length === 0 || depth === 7) {
    return 0;
  }

  for (let i = 0; i < emptySpots.length; i += 1) {
    const move = {};
    const currentEmpttySpots = emptySpots[i];
    const { x, y } = currentEmpttySpots;
    move.position = currentEmpttySpots;
    newFields[x][y] = currentPlayer;

    if (currentPlayer === 2) {
      const result = minimax(newFields, true, depth + 1);
      move.score = result;
    } else {
      const result = minimax(newFields, false, depth + 1);
      move.score = result;
    }

    newFields[x][y] = move.index;
    moves.push(move);
  }

  let bestMove;

  if (currentPlayer === 2) {
    let bestScore = -10000;

    for (let i = 0; i < moves.length; i += 1) {
      const move = moves[i].score;
      if (move > bestScore) {
        bestScore = move;
        bestMove = i;
      }
    }
  } else {
    let bestScore = 10000;

    for (let i = 0; i < moves.length; i += 1) {
      const move = moves[i].score;
      if (move < bestScore) {
        bestScore = move;
        bestMove = i;
      }
    }
  }

  return moves[bestMove];
};

const generateMove = (x, y, points, player) => {
  const move = {
    position: {},
  };

  const newPoints = points.map(row => row.map(field => field));

  newPoints[x][y] = player;
  const result = checkWinner(undefined, newPoints);
  if (result === player) {
    move.position.x = x;
    move.position.y = y;
  }

  return move;
};


const getRandomPosition = (offset = 0) => Math.floor(
  Math.random() * (config.settings.fields - offset),
);

export const simpleBot = (points, player) => {
  const { length } = points;
  let move = {
    position: {},
  };

  move.position.x = getRandomPosition(1);
  move.position.y = getRandomPosition(1);

  while (points[move.position.x][move.position.y] !== '0') {
    move.position.x = getRandomPosition();
    move.position.y = getRandomPosition();
  }
  for (let x = 0; x < length; x += 1) {
    for (let y = 0; y < length; y += 1) {
      if (points[x][y] === player) {
        for (let i = -1; i < 2; i += 1) {
          for (let o = -1; o < 2; o += 1) {
            if (points[x - i] && points[x - i][y - o] === '0') {
              const tempMove = generateMove(x - i, y - o, points, player);

              if (tempMove.position.x) {
                move = tempMove;
              }
            }
          }
        }
      }
    }
  }

  return move;
};
