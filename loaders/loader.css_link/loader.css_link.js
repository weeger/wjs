(function (wjs) {
  'use strict';
  // <--]
  wjs.loader_add('css_link', {
    /**
     * Javascript are loaded via AJAX.
     */
    load: function (url) {
      var script = this.w.document.createElement('link');
      script.setAttribute('type', 'text/css');
      script.setAttribute('rel', 'stylesheet');
      script.setAttribute('media', 'all');
      script.setAttribute('href', url);
      this.w.document.head.appendChild(script);
      this.w.collection(this.type, url, true);
    }
  });
  // [-->
}(wjs));
