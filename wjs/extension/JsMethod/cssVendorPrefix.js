(function (WjsProto) {
  'use strict';
  /**
   * Forked from http://davidwalsh.name/vendor-prefix
   * @type {CssStyle|CSSStyleDeclaration}
   */
  var styles = WjsProto.context.window.getComputedStyle(WjsProto.context.window.document.documentElement, ''),
    prefix = (Array.prototype.slice
      .call(styles)
      .join('')
      .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
      )[1], buffer = {}, prefixBuild = function (name) {
      switch (name) {
        case 'animationDuration':
        case 'animationDelay':
        case 'transform':
          // No mozClassName
          if (prefix === 'moz') {
            return name;
          }
          break;
      }
      return prefix + name.charAt(0).toUpperCase() + name.slice(1);
    };
  /**
   * Return prefixed name of the given CSS property.
   * Only supports methods used internally by wjs.
   */
  WjsProto.register('JsMethod', 'cssVendorPrefix', function (name) {
    if (!buffer[name]) {
      buffer[name] = prefixBuild(name);
    }
    return buffer[name];
  });
}(WjsProto));
