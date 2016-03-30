/**
 * @require JsMethod > arrayDeleteByIndex
 */
(function (WjsProto) {
  'use strict';
  /**
   * Remove item from array.
   *
   * @param {Array} array
   * @param {*} item
   * @returns {*}
   */
  WjsProto.register('JsMethod', 'arrayDeleteItem', function (array, item) {
    return this.arrayDeleteByIndex(array, array.indexOf(item));
  });
}(WjsProto));
