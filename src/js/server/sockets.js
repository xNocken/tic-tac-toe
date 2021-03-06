import io from 'socket.io-client';
import $ from 'jquery';
import { generateFields, spectate, updateStatus } from './renderer';
import { endGame, checkField } from './logic';
import config from '../config';

let attempt = 0;

export default () => {
  if (!config.settings.socket) {
    let nextPlayerInterval;

    config.settings.socket = io(`${config.settings.https ? 'wss' : 'ws'}://${config.settings.ip}:${config.settings.port}`, {
      query: `name=${config.settings.player1}&sessionId=${config.settings.player2}`,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    config.settings.socket.on('winning', () => {
      endGame();
      clearInterval(nextPlayerInterval);
      $('#fields').removeClass('next-player');
    });

    config.settings.socket.on('rejected', (data) => {
      updateStatus(`CONNECTION FAILED: ${data.message}`, 'warning');
      config.settings.socket = undefined;
    });

    config.settings.socket.on('fieldClick', (data) => {
      checkField(data.player, config.settings.field[data.x][data.y]);
      clearInterval(nextPlayerInterval);
      $('#fields').removeClass('next-player');
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
      updateStatus('Disconnected', 'warning');
      clearInterval(nextPlayerInterval);
      $('#fields').empty();
      $('#fields').removeClass('next-player');
    });

    config.settings.socket.on('reconnect_attempt', () => {
      attempt += 1;

      updateStatus(`Reconnecting: Attempt ${attempt}/5`, 'warning');
    });

    config.settings.socket.on('reconnect', () => {
      updateStatus('Successfully reconnected');

      attempt = 0;
    });

    config.settings.socket.on('reconnect_failed', () => {
      updateStatus('CONNECTION FAILED: Can\'t connect to server. Try again or contact the server admin', 'warning');
      config.settings.socket.disconnect();
      config.settings.socket = undefined;

      attempt = 0;
    });

    config.settings.socket.on('updatePlayers', (data) => {
      const wrapper = $('#players');
      const getTemplate = (name, wins) => `<div>${name} Wins: ${wins}</div>`;

      wrapper.empty();

      data.forEach((infos) => {
        wrapper.append(getTemplate(infos.username, infos.wins));
      });
    });

    config.settings.socket.on('nextPlayer', () => {
      nextPlayerInterval = setInterval(() => {
        $('#fields').toggleClass('next-player');
      }, 1000);
    });

    return;
  }

  config.settings.socket.emit('startgame', { length: config.settings.fields });
};
