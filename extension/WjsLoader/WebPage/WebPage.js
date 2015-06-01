/**
 * @require JsClass > BasicWebPage
 * @require JsClassStatic > QueueManager
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('WjsLoader', 'WebPage', {
    loaderExtends: 'WebComp',
    protoBaseClass: 'BasicWebPage',
    pageCurrent: null,
    destroyDelay: 5000,

    __construct: function () {
      this.destroyTimeouts = {};
      this.pageRequireStatic = [];
      this.pageInstances = [];
      this.wjs.loaders.WebComp.__construct.call(this);
      this.queueName = this.type + 'PageLoads';
      this.wjs.window.addEventListener('popstate', this.onPopState.bind(this));
    },

    /**
     * @require JsMethod > urlQueryParse
     * @param e
     */
    onPopState: function () {
      var query = this.wjs.urlQueryParse();
      if (query[this.type]) {
        this.pageHide(query[this.type]);
      }
    },

    /**
     * Fired when use click on a wjs://DemoPage:PageName link.
     * @param name
     */
    link: function (name) {
      this.pageShow(name);
    },

    enable: function (name, value, process) {
      // Create an instance once downloaded.
      if (!process || !process.options.webPagePreload) {
        this.pageCurrent = this.instance(name, value);
      }
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
     * @require JsMethod > cssSheetRules
     */
    pageShow: function (name, complete) {
      var self = this, wjs = self.wjs, type = self.type;
      wjs.queueAdd(self.queueName, function () {
        if (self.pageCurrent) {
          self.pageHide(name, complete);
          // Remove itself
          wjs.queueNext(self.queueName);
          return;
        }
        // Remove destroy time out if exists.
        self.destroyTimeoutClear(name);
        //
        if (!wjs.get(type, name)) {
          wjs.use(type, name, {
            complete: function () {
              self.pageShow(name, complete);
              wjs.queueNext(self.queueName);
            }
          });
        }
        else {
          // In case of use JsLinks some CSSStyleSheets
          // loads can be delayed from the tag append,
          // so we have to ensure that the "sheet" property
          // is available before to continue.
          if (wjs.extRequire[type] &&
            wjs.extRequire[type][name] &&
            wjs.extRequire[type][name].CssLink) {
            var i = 0, item;
            var check = function () {
              i = 0;
              while (item = wjs.extRequire[type][name].CssLink[i++]) {
                var domLink = wjs.get('CssLink', item),
                  rules = wjs.cssSheetRules(domLink.sheet);
                if (domLink.sheet && rules) {
                  wjs.extEnable(type, name);
                  if (complete) {
                    complete();
                  }
                  // Continue queue.
                  wjs.queueNext(self.queueName);
                }
                else {
                  checkRun();
                }
              }
            }, checkRun = function () {
              wjs.window.setTimeout(check, 100);
            };
            while (item = wjs.extRequire[type][name].CssLink[i++]) {
              wjs.loaders.CssLink.enable(item, wjs.get('CssLink', item));
            }
            checkRun();
          }
          else {
            wjs.extEnable(type, name);
            // Continue queue.
            wjs.queueNext(self.queueName);
          }
        }
      });
    },

    /**
     * Hide page.
     * @require JsMethod > extDisable
     */
    pageHide: function (replacement, complete) {
      var self = this;
      self.wjs.queueAdd(self.queueName, function () {
        var pageCurrent = self.pageCurrent,
          loaded = replacement ? false : true,
          exited = pageCurrent ? false : true,
        // Wait for current page to be exited
        // and also for new page preload complete.
          callback = function () {
            if (loaded && exited) {
              if (pageCurrent) {
                // Disable extensions, including removing active CSS.
                self.wjs.extDisable(pageCurrent.loader.type, pageCurrent.type);
                // Launch destroy for owner loader.
                // It will wait before destroying in
                // case of user returns on this page.
                pageCurrent.loader.destroyTimeout(pageCurrent.type);
              }
              // Reset variables.
              self.pageCurrent = false;
              self.pageHideStarted = false;
              // Display new page.
              if (replacement) {
                self.pageShow(replacement, complete);
              }
              else if (complete) {
                complete();
              }
              self.wjs.queueNext(self.queueName);
            }
          };
        // Load replacement page.
        if (replacement) {
          // Clear destroy timeout if exists.
          self.destroyTimeoutClear(replacement);
          // Launch loading, don't wait complete previous element
          // destruction, it can contain asynchronous processes.
          self.wjs.use(self.type, replacement, {
            webPagePreload: true,
            complete: function () {
              loaded = true;
              callback();
            }
          });
        }
        if (pageCurrent) {
          // Launch page exit.
          self.pageCurrent.exit(function () {
            exited = true;
            callback();
          });
        }
        // No current page to quit.
        if (!replacement && !pageCurrent) {
          callback();
        }
      });
    },

    /**
     * @require JsMethod > wjsRegDiffName
     */
    destroyTimeout: function (name) {
      var self = this, callback = function () {
        // Destroy timeout
        delete self.destroyTimeouts[name];
        // No current page, destroy requirements.
        if (!self.pageCurrent) {
          self.wjs.destroy(self.type, name, {
            // Shared dependencies are managed into WebPage.
            dependencies: true
          });
        }
        // Page is not the same one.
        else if (self.pageCurrent.name !== name) {
          // Page should be from the
          // same type to work properly.
          var destroyable = self.wjs.wjsRegDiffName(self.type, name, self.type, self.pageCurrent.type);
          if (Object.keys(destroyable).length) {
            destroyable[self.type] = destroyable[self.type] || [];
            destroyable[self.type].push(name);
          }
          else {
            // Destroy without requirements
            self.wjs.destroy(self.type, name);
          }
        }
      };
      self.destroyTimeouts[name] = self.wjs.window.setTimeout(callback, self.destroyDelay);
    },

    destroyTimeoutClear: function (name) {
      if (this.destroyTimeouts[name]) {
        this.wjs.window.clearTimeout(this.destroyTimeouts[name]);
      }
    }
  });
}(WjsProto));
