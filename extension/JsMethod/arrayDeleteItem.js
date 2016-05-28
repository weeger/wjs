/**
 * @require JsMethod > arrayDeleteByIndex
 */
(function (W) {
  'use strict';
  /**
   * Remove item from array.
   *
   * @param {Array} array
   * @param {*} item
   * @returns {*}
   */
  W.register('JsMethod', 'arrayDeleteItem', function (array, item) {
    return this.arrayDeleteByIndex(array, array.indexOf(item));
  });
}(W));
