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
      urlAlias: {
        defaults: false
      },
      urlHistory: {
        defaults: true,
        unique: true,
        /**
         * @require JsMethod > urlHistory
         */
        define: function (com, value, options) {
          // Define alias.
          com.optionApply('urlAlias', options);
          // Use it as path.
          value = com.urlAlias || value;
          // String value uses custom treatment.
          if (typeof value === 'string') {
            // Apply to history, it updates website path.
            this.wjs.urlHistory(
              // pushState for new page (saved into history,
              // accessible with the back button),
              // replaceState for first loaded page, considered as
              // the real page path.
              (options.html === 'WJS5_PUSH_WEBPAGE_PRELOADED' ? 'replace' : 'push'),
              // Root is not a path,
              // use full site path, to support pointing to root.
              value !== '[root]' ? value : '', undefined, {
                type: com.loader.type,
                name: com.type
              });
          }
          else {
            // Default from webcom.
            this.__super('define', [com, value, options]);
          }
          // Save.
          return value;
        }
      },
      title: {
        define: function (com, value) {
          var websitePageTitle = com.wjs.get('JsObject', 'WebsiteInfo').pageTitle;
          // Prepend website global title
          // defined into settings php file.
          com.wjs.window.document.title = (websitePageTitle || '') + value;
          return value;
        }
      },
      previous: {
        defaults: false
      },
      next: {
        defaults: false
      },
      requireStatic: {
        defaults: false,
        define: function (com, value) {
          var currentNew = {}, previousKeep = {}, previousDelete = {};
          // Search into previous page static requirements.
          if (com.loader.pageRequireStatic) {
            // Iterate over requirements.
            com.wjs.regEach(com.loader.pageRequireStatic, function (type, name) {
              // Item is not into the current page.
              if (!value || !value[type] || value[type].indexOf(name) === -1) {
                previousDelete[type] = previousDelete[type] || [];
                previousDelete[type].push(name);
              }
              else {
                previousKeep[type] = previousKeep[type] || [];
                previousKeep[type].push(name);
              }
            });
          }
          // Delete removed requirements of previous page.
          if (Object.keys(previousDelete).length) {
            com.destroyInstances(com.loader.pageInstances);
          }
          if (value) {
            com.wjs.regEach(value, function (type, name) {
              // Item is not already in the (previous) page.
              if (!previousKeep[type] || previousKeep[type].indexOf(name) === -1) {
                currentNew[type] = currentNew[type] || [];
                currentNew[type].push(name);
              }
            });
          }
          if (Object.keys(currentNew).length) {
            com.loader.pageInstances = com.createInstances(currentNew);
          }
          // Save requirement for the next loaded page.
          com.loader.pageRequireStatic = value;
        }
      },
      require: {
        defaults: false,
        define: function (com, value, options) {
          // Requires dom option.
          com.optionApply('requireStatic', options);
          this.__super('define', [com, value, options]);
        }
      },
      dom: {
        define: function (com, value, options) {
          var preloaded = options.html === 'WJS5_PUSH_WEBPAGE_PRELOADED', output;
          if (preloaded) {
            // Save as imported.
            options.domImported = true;
            // Force option apply.
            com.optionApply('domImported', options);
            // Find dom into document.
            value = this.wjs.document.getElementById(com.type + '-preloaded');
            // Preloaded content is hidden by default.
            value.style.display = null;
          }
          output = this.__super('define', [com, value, options]);
          // Search for links.
          this.wjs.wjsHrefInit(output);
          return output;
        }
      },
      html: {
        define: function (com, value, options) {
          // Requires html && dom option.
          com.optionApply('dom', options);
          if (value !== 'WJS5_PUSH_WEBPAGE_PRELOADED') {
            this.__super('define', [com, value, options]);
          }
          else {
            var dom = com.dom.getElementsByClassName('html')[0];
            com.options.html.valuePreloaded = dom.innerHTML;
            com.domChildAdd('html', dom);
          }
        },
        destroy: function (com, value) {
          if (com.html !== 'WJS5_PUSH_WEBPAGE_PRELOADED') {
            this.__super('destroy', [com, value]);
          }
          else {
            this.wjs.extLoaded[com.loader.type][com.type].html = com.options.html.valuePreloaded;
            this.wjs.destroy(com.loader.type, com.type);
          }
        }
      }
    },

    __construct: function () {
      // Only one "current" page.
      this.loader.pageCurrent = this;
      // Web com constructor.
      this.__super('__construct', arguments);
      // Shorthand.
      this.initWebPage();
      // Execute callbacks append before page load.
      this.wjs.callbacks(this.loader.pageReadyCallbacks);
      // Reset callback list.
      this.loader.pageReadyCallbacks = [];
      // Allow to load a new page.
      this.loader.pageShowLast = undefined;
    },

    __destruct: function () {
      this.exitWebPage();
      // Reset variables.
      this.loader.pageCurrent = false;
      this.__super('__destruct', arguments);
    },

    // To override...
    initWebPage: WjsProto._e,

    // To override...
    exitWebPage: WjsProto._e
  });
}(WjsProto));
