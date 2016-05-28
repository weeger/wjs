(function (W) {
  'use strict';
  /**
   * Returns true if child is descendant of parent.
   */
  W.register('JsMethod', 'domIsDescendant', function (parent, child) {
    var node = child.parentNode;
    while (node !== null) {
      if (node === parent) {
        return true;
      }
      node = node.parentNode;
    }
    return false;
  });
}(W));
