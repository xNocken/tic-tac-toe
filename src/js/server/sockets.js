import io from 'socket.io-client';
import { generateFields, spectate, updateStatus } from './renderer';
import { endGame, checkField } from './logic';
import config from '../config';

export default () => {
  if (!config.settings.socket) {
    config.settings.socket = io(`ws://${config.settings.ip}:${config.settings.port}`);

    config.settings.socket.on('winning', () => {
      endGame();
    });

    config.settings.socket.on('rejected', (data) => {
      updateStatus(`CONNECTION FAILED: ${data.message}`, 'warning');
    });

    config.settings.socket.on('fieldClick', (data) => {
      checkField(data.player, config.settings.field[data.x][data.y]);
    });

    config.settings.socket.on('spectate', (data) => {
      spectate(data.fields);
    });

    config.settings.socket.on('generatefields', (data) => {
      generateFields(data.length);
    });

    config.settings.socket.on('updateStatus', (data) => {
      updateStatus(data.message);
    });

    config.settings.socket.on('disconnect', () => {
      config.settings.socket = undefined;
    });

    config.settings.socket.emit('startgame', { length: config.settings.fields, player1: config.settings.player1 });
    return;
  }

  config.settings.socket.emit('startgame', { length: config.settings.fields, player1: config.settings.player1 });
};
