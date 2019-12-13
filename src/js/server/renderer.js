import $ from 'jquery';

import { fieldClick } from './logic';
import config from '../config';

export const generateFields = (length) => {
  const fields = Array.from({ length })
    .map((_, xIndex) => Array.from({ length })
      .map((__, yIndex) => {
        const $field = $('<div class="field"></div>');

        $field.data('info', {
          x: xIndex,
          y: yIndex,
          clicked: false,
          player: 0,
        });

        return $field;
      }));

  config.setSetting('field', fields);

  $('#fields').empty();

  fields.forEach((row) => {
    const $row = $('<div class="row"></div>');

    row.forEach(($field) => {
      $field.on('click', () => fieldClick($field));

      $row.append($field);
    });

    $('#fields').append($row);
  });

  return fields;
};

export const spectate = (fields) => {
  const newField = generateFields(fields.length);

  fields.forEach(($row, xIndex) => {
    $row.forEach(($field, yIndex) => {
      if ($field) {
        newField[xIndex][yIndex].addClass(`field--clicked-player${$field}`);
      }
    });
  });
};

export const updateStatus = (message, addedClass = '') => {
  $('#status').prepend(`<p class="${addedClass}">${message}</p>`);
};
