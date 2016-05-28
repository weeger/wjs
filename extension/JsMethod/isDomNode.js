(function (W) {
  'use strict';
  /**
   * Returns true if it is a DOM node.
   */
  W.register('JsMethod', 'isDomNode', function (object) {
    return typeof this.window.Node === 'object' ?
      object instanceof this.window.Node :
      object && typeof object === 'object' &&
        typeof object.nodeType === 'number' &&
        typeof object.nodeName === 'string';
  });
}(W));
