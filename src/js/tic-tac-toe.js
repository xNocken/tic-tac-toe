import $ from 'jquery';
import config from './config';

const getObjectFromSerializeString = string => string.split('&')
  .map((item) => {
    const splitItem = item.split('=');
    return splitItem[1];
  });

const checkWinner = (fields) => {
  const points = fields.map(item => item.map(elem => elem.data('info').player || 0));
  const rowLength = parseInt(config.settings.fields, 10);

  let lastPlayer = 0;
  let countPlayer1 = 0;
  let countPlayer2 = 0;
  let winner = 0;

  let hi = [];

  console.log(points);

  for (let o = 0; o < rowLength; o += 1) {
    countPlayer1 = 0;
    console.log('clear stats');
    countPlayer2 = 0;
    console.log('RESET');

    for (let i = 0; i < rowLength; i += 1) {
      if (points[o][o]) {
        if ((points[o][i] === 1 && ((i === 0 && o === 0) || (i !== o))) || (points[i][i] === 1 && i === 0 && o === 0) || (points[i][o] === 1 && ((i === 0 && o === 0) || (i !== o)))) {
          countPlayer1 += 1;
        }

        if ((points[o][i] === 2 && i === 0) || (points[i][i] === 2 && i === 0 && o === 0) || (points[i][o] === 2 && o === 0)) {
          countPlayer2 += 1;
        }
        console.log('o: ', o, ' i: ', i);
        if (countPlayer1 === rowLength) {
          winner = 1;
          console.log('Winner: ', 1, o, i);
        }

        if (countPlayer2 === rowLength) {
          console.log('Winner: ', 2, o, i);
          winner = 2;
        }
        console.log(countPlayer1, countPlayer2);
      } else {
        countPlayer1 = 0;
        countPlayer2 = 0;
        console.log('clear stats');
      }
    }
  }

  // points.forEach((row, xIndex) => {
  //   row.forEach((elem, yIndex) => {
  //     if (elem === 0) {
  //       return;
  //     }

  //     if (elem !== lastPlayer) {
  //       lastPlayer = elem;
  //       count = 0;
  //       return;
  //     }
  //     lastPlayer = elem;
  //     count += 1;
  //     console.log(count, elem, rowLength);
  //     if (count === rowLength) {
  //       winner = lastPlayer;
  //     }
  //   });
  // });

  console.log(winner);
};

const fieldClick = ($element, isPlayer1) => {
  const infos = $element.data('info');

  $element.addClass(`field--clicked-player${isPlayer1 ? 1 : 2}`);

  infos.clicked = true;
  infos.player = isPlayer1 ? 1 : 2;
  $element.data('info', infos);
};

export default () => {
  let isPlayer1 = true;

  $('#start-form').on('submit', (event) => {
    event.preventDefault();

    const h = getObjectFromSerializeString($(event.target).serialize());

    const gameSettings = {
      fields: h[1],
      name: h[0],
    };

    config.setSetting('player1', h[0]);
    config.setSetting('fields', h[1]);

    const length = gameSettings.fields;

    const fields = Array.from({ length })
      .map((item, xIndex) => Array.from({ length })
        .map((item2, yIndex) => {
          const element = $('<div class="field"></div>');

          element.data('info', { x: xIndex, y: yIndex, clicked: false });
          return element;
        }));

    $('#fields').empty();
    fields.forEach((item) => {
      const row = $('<div class="row"></div>');

      item.forEach((element) => {
        element.on('click', () => {
          if (!element.data('info').clicked) {
            fieldClick(element, isPlayer1);
            isPlayer1 = !isPlayer1;
            checkWinner(fields);
          }
        });
        row.append(element);
      });

      $('#fields').append(row);
    });
  });
};
