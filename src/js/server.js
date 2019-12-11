/* eslint-disable no-alert */
import $ from 'jquery';
import io from 'socket.io-client';
import config from './config';

let socket;

const endGame = (cMessage) => {
  alert(cMessage);
  $('.field').unbind('click');
};

const checkField = (player, $element) => {
  const infos = $element.data('info');

  $element.addClass(`field--clicked-player${player}`);

  infos.clicked = true;
  infos.player = player;
  $element.data('info', infos);
};

const fieldClick = ($element) => {
  const infos = $element.data('info');
  socket.emit('click', { x: infos.x, y: infos.y });
};

const generateFields = (length) => {
  const fields = Array.from({ length })
    .map((_, xIndex) => Array.from({ length })
      .map((__, yIndex) => {
        const element = $('<div class="field"></div>');

        element.data('info', {
          x: xIndex,
          y: yIndex,
          clicked: false,
          player: 0,
        });
        return element;
      }));
  config.setSetting('field', fields);

  $('#fields').empty();
  fields.forEach((item) => {
    const row = $('<div class="row"></div>');
    item.forEach((element) => {
      element.on('click', () => {
        fieldClick(element);
      });
      row.append(element);
    });

    $('#fields').append(row);
  });
  return fields;
};

const spectate = (fields) => {
  const newField = generateFields(fields.length);
  fields.forEach((item, xIndex) => {
    item.forEach((item2, yIndex) => {
      if (item) {
        newField[xIndex][yIndex].addClass(`field--clicked-player${item2}`);
      }
    });
  });
};

const createSocket = () => {
  if (socket) {
    socket.disconnect();
  }

  socket = io('ws://172.17.2.156:8080');

  socket.on('winner', (data) => {
    endGame(0, false, false, data.message);
  });

  socket.on('fieldClick', (data) => {
    checkField(data.player, config.settings.field[data.x][data.y]);
  });

  socket.on('spectate', (data) => {
    spectate(data.fields);
  });

  socket.on('generatefields', (data) => {
    generateFields(data.length);
  });

  socket.emit('startgame', { length: config.settings.fields, player1: config.settings.player1 });
};

export default () => createSocket();
