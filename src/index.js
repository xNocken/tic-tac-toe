import $ from 'jquery';

import ticTacToe from './js/start';

import './scss/main.scss';

global.$ = $;


$(() => {
  ticTacToe();
});
