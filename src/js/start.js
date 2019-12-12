import $ from 'jquery';

import config from './config';
import server from './server/sockets';
import renderer from './offline/renderer';

export default () => {
  $('#start-form').on('submit', (event) => {
    event.preventDefault();

    const { target } = event;
    const fields = target[2].value;
    const mode = target[3].value;

    config.setSettings({
      mode,
      fields,
      clicked: 0,
      inputBlocked: false,
      isPlayer1: true,
      player1: target[0].value || 'Player 1',
      player2: target[1].value || 'Player 2',
      maxFields: parseInt(fields, 10) ** 2,
    });

    if (mode === '3') {
      server();

      return;
    }

    renderer();
  });
};
