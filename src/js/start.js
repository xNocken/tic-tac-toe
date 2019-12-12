import $ from 'jquery';
import config from './config';
import server from './server/sockets';
import renderer from './offline/renderer';


export default () => {
  $('#start-form').on('submit', (event) => {
    event.preventDefault();
    const { target } = event;

    config.setSetting('inputBlocked', false);
    config.setSetting('isPlayer1', true);
    config.setSetting('clicked', 0);
    config.setSetting('player1', target[0].value);
    config.setSetting('player2', target[1].value);
    config.setSetting('fields', target[2].value);
    config.setSetting('mode', target[3].value);
    config.setSetting('maxFields', parseInt(target[2].value, 10) * parseInt(target[2].value, 10));

    if (target[3].value === '3') {
      server();
      return;
    }

    renderer();
  });
};
