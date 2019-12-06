import $ from 'jquery';
import ticTacToe from './js/tic-tac-toe';

import './scss/main.scss';

global.$ = $;


$(() => {
  ticTacToe();
});
