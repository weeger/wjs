(function (WjsProto) {
  'use strict';
  /**
   * Returns list of attributes
   * of given dom object.
   */
  WjsProto.register('JsMethod', 'domAttributes', function (domNode) {
    var i = 0, output = {},
      domAttributes = Array.prototype.slice.call(domNode.attributes);
    for (; i < domAttributes.length; i++) {
      output[domAttributes[i].localName] = domAttributes[i].value;
    }
    return output;
  });
}(WjsProto));
