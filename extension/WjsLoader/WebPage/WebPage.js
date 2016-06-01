/**
 * @require JsScript > SchemeWebPage
 * @require JsClassStatic > QueueManager
 */
(function (W) {
  'use strict';
  W.register('WjsLoader', 'WebPage', {
    loaderExtends: 'WebCom',
    protoBaseClass: 'WebPage',
    pageCurrent: null,
    destroyDelay: 5000,

    __construct: function () {
      this.destroyTimeouts = {};
      this.pageRequireStatic = [];
      this.pageInstances = [];
      this.pageReadyCallbacks = [];
      this.pageShowLast = undefined;
      // Load URL params.
      var params = this.w.urlQueryParse();
      // Search for requirement of default page.
      if (params[this.type]) {
        // Page should be already preloaded.
        delete params[this.type];
        // We don't need to let webcom to auto load it.
        this.w.urlQueryReplace(params);
      }
      // Basic construct.
      this.w.loaders.WebCom.__construct.call(this);
      // Use custom queue to manage page loads.
      this.queueName = this.type + 'PageLoads';
      // Listen for back button.
      this.w.window.addEventListener('popstate', this.onPopState.bind(this));
    },

    /**
     * @require JsMethod > urlQueryParse
     */
    onPopState: function (e) {
      var query = this.w.urlQueryParse();
      // Search into saved alias.
      if (e.state.type === this.type && e.state.name) {
        this.pageHide(e.state.name);
      }
      // Search into query string.
      else if (query[this.type]) {
        this.pageHide(query[this.type]);
      }
    },

    /**
     * Fired when use click on a w://DemoPage:PageName link.
     * @param name
     */
    link: function (name) {
      // Allow only one call for each page name.
      if (name === this.pageShowLast) {
        return;
      }
      // Save name.
      this.pageShowLast = name;
      this.pageShow(name);
    },

    enable: function (name, value, process) {
      // Create an instance once downloaded.
      if (!process || !process.options.webPagePreload) {
        // Creating instance will set pageCurrent.
        this.instance(name, value);
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
      var self = this, w = self.w, type = self.type;
      // Pages loads / hides are queued.
      w.queueAdd(self.queueName, function () {
        // There is a current page to close.
        if (self.pageCurrent) {
          // Do not display the same page.
          if (self.pageCurrent.name !== name) {
            // Hide will close current and relaunch show.
            self.pageHide(name, complete);
          }
          // Remove itself.
          w.queueNext(self.queueName);
          return;
        }
        // Remove destroy time out if exists.
        self.destroyTimeoutClear(name);
        // Page to show is not loaded.
        if (!w.get(type, name)) {
          // Standard load.
          w.use(type, name, function () {
            self.pageShowLast = undefined;
            // Launch again (new queue item).
            self.pageShow(name, complete);
            // Clear this queued item.
            w.queueNext(self.queueName);
          });
        }
        else {
          // In case of using JsLinks, some CSSStyleSheets
          // loads can be delayed from the tag append,
          // so we have to ensure that the "sheet" property
          // is available before to continue.
          if (w.extRequire[type] &&
            w.extRequire[type][name] &&
            w.extRequire[type][name].CssLink) {
            var i = 0, item;
            var check = function () {
              i = 0;
              while (item = w.extRequire[type][name].CssLink[i++]) {
                var domLink = w.get('CssLink', item),
                  rules = w.cssSheetRules(domLink.sheet);
                if (domLink.sheet && rules) {
                  w.extEnable(type, name);
                  if (complete) {
                    complete();
                  }
                  // Continue queue.
                  w.queueNext(self.queueName);
                }
                else {
                  checkRun();
                }
              }
            }, checkRun = function () {
              w.window.setTimeout(check, 100);
            };
            while (item = w.extRequire[type][name].CssLink[i++]) {
              w.loaders.CssLink.enable(item, w.get('CssLink', item));
            }
            checkRun();
          }
          else {
            w.extEnable(type, name);
            // Continue queue.
            w.queueNext(self.queueName);
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
      // Pages loads / hides are queued.
      self.w.queueAdd(self.queueName, function () {
        var pageCurrent = self.pageCurrent,
          loaded = !replacement,
          exited = !pageCurrent,
        // Wait for current page to be exited
        // and also for new page preload complete.
          callback = function () {
            if (loaded && exited) {
              if (pageCurrent) {
                // Disable extensions, including removing active CSS.
                self.w.extDisable(pageCurrent.loader.type, pageCurrent.type);
                // Launch destroy for owner loader.
                // It will wait before destroying in
                // case of user returns on this page.
                pageCurrent.loader.destroyTimeout(pageCurrent.type);
              }

              self.pageHideStarted = false;
              // Display new page.
              if (replacement) {
                self.pageShow(replacement, complete);
              }
              else if (complete) {
                complete();
              }
              self.w.queueNext(self.queueName);
            }
          };
        // Load replacement page.
        if (replacement) {

          // Clear destroy timeout if exists.
          self.destroyTimeoutClear(replacement);
          // Launch loading, don't wait complete previous element
          // destruction, it can contain asynchronous processes.
          self.w.use(self.type, replacement, {
            webPagePreload: true,
            complete: function () {
              loaded = true;
              callback();
            }
          });
        }
        if (pageCurrent) {
          log('B');
          // Launch page exit.
          self.pageCurrent.exit(function () {
            log('1');
            exited = true;
            callback();
          });
        }
        // No current page to quit.
        if (!replacement && !pageCurrent) {
          log('C');
          callback();
        }
      });
    },

    pageReady: function (callback) {
      this.pageReadyCallbacks.push(callback);
    },

    /**
     * @require JsMethod > wjsRegDiffName
     */
    destroyTimeout: function (name) {
      var self = this, callback = function () {
        // Destroy timeout
        delete self.destroyTimeouts[name];
        // No current page, do not destroy anything.
        if (self.pageCurrent) {
          // Page should be from the
          // same type to work properly.
          var destroyable = self.w.wjsRegDiffName(self.type, name, self.type, self.pageCurrent.type);
          if (Object.keys(destroyable).length) {
            destroyable[self.type] = destroyable[self.type] || [];
            destroyable[self.type].push(name);
          }
          else {
            // Destroy without requirements
            self.w.destroy(self.type, name);
          }
        }
      };
      self.destroyTimeouts[name] = self.w.window.setTimeout(callback, self.destroyDelay);
    },

    destroyTimeoutClear: function (name) {
      if (this.destroyTimeouts[name]) {
        this.w.window.clearTimeout(this.destroyTimeouts[name]);
      }
    }
  });
}(W));
