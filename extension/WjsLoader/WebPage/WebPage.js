/**
 * @require JsClass > BasicWebPage
 */
(function (WjsProto) {
  'use strict';
  // <--]
  WjsProto.register('WjsLoader', 'WebPage', {
    loaderExtends: 'WebComp',
    protoBaseClass: 'BasicWebPage',
    pageCurrent: null,
    destroyDelay: 5000,

    __construct: function () {
      this.destroyTimeouts = {};
      this.wjs.loaders.WebComp.__construct.call(this);
    },

    /**
     * Fired when use click on a wjs://DemoPage:PageName link.
     * @param name
     */
    link: function (name) {
      this.pageShow(name);
    },

    parse: function (name, value, process) {
      return this.wjs.loaders.WebComp.parse.apply(this, arguments);
    },

    enable: function (name, value, process) {
      // Create an instance once downloaded.
      // Auto instance can be explicitly activated
      if (!process || !process.options.webPagePreload) {
        this.instance(name, value);
      }
    },

    /**
     * Save instance, one page allowed at the same time.
     */
    instance: function (name, options) {
      // Save current page.
      return this.pageCurrent = this.wjs.loaders.WebComp.instance.apply(this, arguments);
    },

    /**
     * Change page using previous / next keywords.
     * @param direction
     */
    pageChange: function (direction) {
      if (this.pageCurrent[direction]) {
        this.pageHide(this.pageCurrent[direction]);
      }
    },

    /**
     * Display loaded page, launch load animations.
     * @require JsMethod > extEnable
     */
    pageShow: function (name) {
      var wjs = this.wjs;
      if (this.pageCurrent) {
        this.pageHide(name);
        return;
      }
      // Remove destroy time out.
      if (this.destroyTimeouts[name]) {
        this.wjs.window.clearTimeout(this.destroyTimeouts[name]);
      }
      if (!wjs.get(this.type, name)) {
        wjs.use(this.type, name);
      }
      else {
        wjs.extEnable(this.type, name);
      }
    },

    /**
     * Hide page.
     * @require JsMethod > extDisable
     */
    pageHide: function (replacement) {
      // Prevent multiple loads.
      if (!this.pageHideStarted) {
        var self = this, pageCurrent = self.pageCurrent,
          loaded = false, exited = false,
        // Wait for current page to be exited
        // and also for new page preload complete.
          callback = function () {
            if (loaded && exited) {
              var pageCurrent = self.pageCurrent;
              // Launch destroy for owner loader.
              pageCurrent.loader.destroyTimeout(pageCurrent.type);
              self.wjs.extDisable(pageCurrent.loader.type, pageCurrent.type);
              self.pageCurrent = false;
              self.pageHideStarted = false;
              self.pageShow(replacement);
            }
          };
        self.pageHideStarted = true;
        // Launch loading, don't wait complete element
        // destruction, it can contain asynchronous processes.
        self.wjs.use(this.type, replacement, {
          webPagePreload: true,
          complete: function (reg) {
            loaded = true;

            log(reg);
            callback();
          }
        });
        // Launch page exit.
        pageCurrent.exit(function () {
          exited = true;
          callback();
        });
      }
    },

    destroyTimeout: function (name) {
      var self = this, callback = function () {
        self.wjs.destroy(self.type, name, {
          // TODO : Shared dependencies.
          dependencies: true
        });
        delete self.destroyTimeouts[name];
      };
      this.destroyTimeouts[name] = this.wjs.window.setTimeout(callback, this.destroyDelay);
    }
  });
  // [-->
}(WjsProto));
