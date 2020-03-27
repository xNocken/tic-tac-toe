import $ from 'jquery';

import config from './config';
import server from './server/sockets';
import renderer from './offline/renderer';

export default () => {
  $('#mode').on('change', () => {
    if ($('#mode')[0].value === '3') {
      $('#name2')[0].placeholder = 'SessionID';
      $('#name2Span')[0].innerText = 'SessionID';
    } else {
      $('#name2')[0].placeholder = 'Name player 2';
      $('#name2Span')[0].innerText = 'Name player 2';
    }
  });

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
      player1: target[0].value,
      player2: target[1].value,
      maxFields: parseInt(fields, 10) ** 2,
    });

    if (mode === '3') {
      server();

      return;
    }

    renderer();
  });
};
