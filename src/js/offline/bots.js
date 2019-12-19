/* eslint-disable-next-line */ // ⊙.☉
import { checkWinner } from './logic';
import config from '../config';

const getEmptySpots = (fields) => {
  const emptySpots = [];
  fields.forEach((row, x) => {
    row.forEach((field, y) => {
      if (field === '0' || field === undefined) {
        emptySpots.push({ x, y });
      }
    });
  });

  return emptySpots;
};

export const minimax = (fields, isPlayer1 = false, depth = 0) => {
  const newFields = fields;
  const currentPlayer = isPlayer1 ? 1 : 2;
  const emptySpots = getEmptySpots(fields);
  const moves = [];
  const winner = checkWinner(undefined, fields);

  if (winner === 1) {
    return { score: -10 };
  }
  if (winner === 2) {
    return { score: 10 };
  }
  if (emptySpots.length === 0 || depth === 20) {
    return { score: 0 };
  }

  for (let i = 0; i < emptySpots.length; i += 1) {
    const move = {};
    move.position = emptySpots[i];
    newFields[emptySpots[i].x][emptySpots[i].y] = currentPlayer;

    if (currentPlayer === 2) {
      const result = minimax(newFields, true, depth + 1);
      move.score = result.score;
    } else {
      const result = minimax(newFields, false, depth + 1);
      move.score = result.score;
    }

    newFields[emptySpots[i].x][emptySpots[i].y] = move.index;
    moves.push(move);
  }

  let bestMove;

  if (currentPlayer === 2) {
    let bestScore = -10000;

    for (let i = 0; i < moves.length; i += 1) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    let bestScore = 10000;

    for (let i = 0; i < moves.length; i += 1) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
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

  const newPoints = [[], [], []];

  for (let index = 0; index < points.length; index += 1) {
    for (let index2 = 0; index2 < points.length; index2 += 1) {
      newPoints[index][index2] = points[index][index2];
    }
  }

  newPoints[x][y] = player;
  const result = checkWinner(undefined, newPoints);
  if (result === player) {
    // console.log(JSON.stringify(points));
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
        if (points[x - 1] && points[x - 1][y] === '0') {
          const tempMove = generateMove(x - 1, y, points, player);
          if (tempMove.position.x) {
            move = tempMove;
          }
        }

        if (points[x + 1] && points[x + 1][y] === '0') {
          const tempMove = generateMove(x + 1, y, points, player);
          if (tempMove.position.x) {
            move = tempMove;
          }
        }

        if (points[x] && points[x][y - 1] === '0') {
          const tempMove = generateMove(x, y - 1, points, player);
          if (tempMove.position.x) {
            move = tempMove;
          }
        }

        if (points[x] && points[x][y + 1] === '0') {
          const tempMove = generateMove(x, y + 1, points, player);
          if (tempMove.position.x) {
            move = tempMove;
          }
        }
      }
    }
  }

  return move;
};
