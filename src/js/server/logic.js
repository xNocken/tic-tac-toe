import $ from 'jquery';
import config from '../config';

export const endGame = () => {
  $('.field').unbind('click');
};

export const checkField = (player, $element) => {
  const infos = $element.data('info');

  $element.addClass(`field--clicked-player${player}`);

  infos.clicked = true;
  infos.player = player;
  $element.data('info', infos);
};

export const fieldClick = ($element) => {
  const infos = $element.data('info');
  config.settings.socket.emit('click', { x: infos.x, y: infos.y });
};
