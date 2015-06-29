/**
 * Base class for WebCom elements.
 * @require JsScript > SchemeWebCom
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('WebComScheme', 'SchemeWebPage', {
    classExtends: 'WebCom',
    type: 'WebPage',

    options: {
      dom: {
        define: function (com, value, options) {
          var preloaded = options.html === 'WJS_PUSH_WEBPAGE_PRELOADED';
          if (preloaded) {
            this.domImported = true;
            value = this.wjs.document.getElementById(com.type + '-preloaded')
          }
          return this.__super('define', [com, value, options]);
        }
      }
    },

    __construct: function () {
      this.__super('__construct', arguments);
      this.webPageInit();
    },

    __destruct: function () {
      this.webPageExit();
      this.__super('__destruct', arguments);
    },

    // To override... TODO initWebPage
    webPageInit: WjsProto._e,

    // To override...
    webPageExit: WjsProto._e
  });
}(WjsProto));
