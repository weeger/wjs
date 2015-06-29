(function (WjsProto) {
  'use strict';
  /**
   * Disable ctrl+s on hole page.
   */
  WjsProto.register('JsClassStatic', 'DisableCtrlS', {
    __construct: function () {
      this.wjs.document.onkeydown = function (event) {
        // The property to obtain a keycode depends on browsers you are using.
        // The following statement allows you to obtain a keycode
        var code = (event.keyCode || event.which);
        // code 83 is  'S'
        if (!(code === 83 && event.ctrlKey)) {
          return true;
        }
        // the preventDefault method disables the default behavior.
        event.preventDefault();
        return false;
      };
    }
  });
}(WjsProto));
