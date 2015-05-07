/**
 * @require JsClass > BasicWebPage
 */
(function (WjsProto) {
  'use strict';
  // <--]
  WjsProto.register('WjsLoader', 'WebPage', {
    loaderExtends: 'WebComp',
    protoBaseClass: 'BasicWebPage',
    autoInstance: true,
    pageCurrent: null,

    /**
     * Fired when use click on a wjs://DemoPage:PageName link.
     * @param name
     */
    link: function (name) {
      this.pageShow(name);
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
     */
    pageShow: function (name) {
      var wjs = this.wjs;
      if (this.pageCurrent) {
        this.pageHide(name);
        return;
      }
      if (!wjs.get(this.type, name)) {
        wjs.use(this.type, name, {
          autoInstance: true
        });
      }
      else {
        wjs.loaders[this.type].instance(name);
      }
    },

    /**
     * Hide page.
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
              self.pageHideStarted = false;
              self.pageShow(replacement);
            }
          };
        self.pageHideStarted = true;
        // Launch loading, don't wait complete element
        // destruction, it can contain asynchronous processes.
        self.wjs.use(this.type, replacement, {
          autoInstance: false,
          complete: function () {
            loaded = true;
            callback();
          }
        });
        // Launch page exit.
        pageCurrent.exit(function () {
          self.wjs.destroy(self.type, self.pageCurrent.type, {
            dependencies: true,
            complete: function () {
              // TODO : Allow to destroy with a delay, in case of quick revert
              // TODO : We need to be able to "disable" extension without destroying it in case of css and js files.
              exited = true;
              callback();
            }
          });
          self.pageCurrent = false;
        });
      }
    }
  });
  // [-->
}(WjsProto));
