(function (wjs) {
  'use strict';
  // <--]
  wjs.loader_add('javascript_link', {
    /**
     * Javascript are loaded via AJAX.
     */
    load: function (urls, complete) {
      urls = (typeof urls === 'string') ? [urls] : urls;
      this.queue = urls;
      this.queue_complete = complete;
      this.js_link_queue_check();
    },

    js_link_queue_next: function () {
      var url = this.queue.shift(),
        script = this.w.document.createElement('script');

      script.onreadystatechange = function () {
        if (this.readyState === 'complete') {
          this.js_link_queue_check();
        }
      }.bind(this);
      script.onload = this.js_link_queue_check.bind(this);
      script.setAttribute('type', 'text/javascript');
      script.setAttribute('src', url);
      this.w.document.head.appendChild(script);
      this.w.collection(this.type, url, true);
    },

    js_link_queue_check: function () {
      if (this.queue.length > 0) {
        this.js_link_queue_next();
      }
      else if (typeof this.queue_complete === 'function') {
        this.queue_complete();
      }
    }
  });
  // [-->
}(wjs));
