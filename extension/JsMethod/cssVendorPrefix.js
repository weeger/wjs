(function (W) {
  'use strict';
  /**
   * Forked from http://davidwalsh.name/vendor-prefix
   * @type {CssStyle|CSSStyleDeclaration}
   */
  var styles = W.context.window.getComputedStyle(W.context.window.document.documentElement, ''),
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
  W.register('JsMethod', 'cssVendorPrefix', function (name) {
    if (!buffer[name]) {
      buffer[name] = prefixBuild(name);
    }
    return buffer[name];
  });
}(W));