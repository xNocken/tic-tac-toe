import $ from 'jquery';

import config from '../config';

export const endGame = () => {
  $('.field').unbind('click');
};

export const checkField = (player, $element) => {
  const info = $element.data('info');

  $element.addClass(`field--clicked-player${player}`);

  info.clicked = true;
  info.player = player;

  $element.data('info', info);
};

export const fieldClick = ($element) => {
  const { x, y } = $element.data('info');

  config.settings.socket.emit('click', { x, y });
};
