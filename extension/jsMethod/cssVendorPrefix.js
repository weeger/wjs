(function (WjsProto) {
  'use strict';
  /**
   * Apply a animation delay for each items selected.
   */
  WjsProto.register('JsMethod', 'cssVendorPrefix', function (name, domStyle) {
    // If property is not undefined, no prefix needed.
    if (domStyle && domStyle[name] !== undefined) {
      return name;
    }
    if (!this._cssVendorPrefix) {
      // Forked from http://davidwalsh.name/vendor-prefix
      var styles = this.window.getComputedStyle(this.document.documentElement, '');
      this._cssVendorPrefix = (Array.prototype.slice
        .call(styles)
        .join('')
        .match(/-(moz|webkit|ms)-/) || (styles.OLink === '' && ['', 'o'])
        )[1];
    }
    return this._cssVendorPrefix + name.charAt(0).toUpperCase() + name.slice(1);
  });
}(WjsProto));
