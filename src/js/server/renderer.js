import $ from 'jquery';
import { fieldClick } from './logic';
import config from '../config';

export const generateFields = (length) => {
  const fields = Array.from({ length })
    .map((_, xIndex) => Array.from({ length })
      .map((__, yIndex) => {
        const element = $('<div class="field"></div>');

        element.data('info', {
          x: xIndex,
          y: yIndex,
          clicked: false,
          player: 0,
        });
        return element;
      }));
  config.setSetting('field', fields);

  $('#fields').empty();
  fields.forEach((item) => {
    const row = $('<div class="row"></div>');
    item.forEach((element) => {
      element.on('click', () => {
        fieldClick(element);
      });
      row.append(element);
    });

    $('#fields').append(row);
  });
  return fields;
};

export const spectate = (fields) => {
  const newField = generateFields(fields.length);
  fields.forEach((item, xIndex) => {
    item.forEach((item2, yIndex) => {
      if (item) {
        newField[xIndex][yIndex].addClass(`field--clicked-player${item2}`);
      }
    });
  });
};

export const updateStatus = (message, addedClass = '') => {
  $('#status').prepend(`<p class="${addedClass}">${message}</p>`);
};
