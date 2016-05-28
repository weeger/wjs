(function (W) {
  'use strict';
  /**
   * Remove item having this index from array.
   *
   * @param {Array} array
   * @param {number} index
   * @returns {Array}
   */
  W.register('JsMethod', 'arrayDeleteByIndex', function (array, index) {
    if (index !== -1) {
      array.splice(index, 1);
    }
    return array;
  });
}(W));
