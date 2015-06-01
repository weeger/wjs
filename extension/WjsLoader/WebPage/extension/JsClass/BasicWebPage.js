/**
 * Base class for WebComp elements.
 * @require JsClass > BasicWebComp
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('JsClass', 'BasicWebPage', {
    classExtends: 'BasicWebComp',
    type: 'WebPage',

    options: {
      urlHistory: {
        defaults: true,
        unique: true
      },
      previous: {
        defaults: false
      },
      next: {
        defaults: false
      },
      requireStatic: {
        defaults: false,
        define: function (value) {
          var currentNew = {}, previousKeep = {}, previousDelete = {};
          // Search into previous page static requirements.
          if (this.loader.pageRequireStatic) {
            // Iterate over requirements.
            this.wjs.regEach(this.loader.pageRequireStatic, function (type, name) {
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
            this.destroyInstances(previousDelete, this.loader.pageInstances);
          }
          if (value) {
            this.wjs.regEach(value, function (type, name) {
              // Item is not already in the (previous) page.
              if (!previousKeep[type] || previousKeep[type].indexOf(name) === -1) {
                currentNew[type] = currentNew[type] || [];
                currentNew[type].push(name);
              }
            });
          }
          if (Object.keys(currentNew).length) {
            this.loader.pageInstances = this.useInstances(currentNew);
          }
          // Save requirement for the next loaded page.
          this.loader.pageRequireStatic = value;
        }
      },
      require: {
        defaults: false,
        define: function (value, options) {
          // Requires dom option.
          this.optionApply('requireStatic', options);
          this.__base(value, options);
        }
      },
      dom: {
        define: function (value, options) {
          var preloaded = options.html === 'WJS_PUSH_WEBPAGE_PRELOADED';
          if (preloaded) {
            this.domImported = true;
            value = this.wjs.document.getElementById(this.type + '-preloaded')
          }
          this.__base(value, options);
        }
      },
      html: {
        define: function (value, options) {
          // Requires html && dom option.
          this.optionApply('dom', options);
          if (value !== 'WJS_PUSH_WEBPAGE_PRELOADED') {
            this.__base(value, options);
          }
          else {
            var dom = this.dom.getElementsByClassName('html')[0];
            this.options.html.valuePreloaded = dom.innerHTML;
            this.domChildAdd('html', dom);
          }
        },
        destroy: function (value) {
          if (value !== 'WJS_PUSH_WEBPAGE_PRELOADED') {
            this.__base();
          }
          else {
            this.wjs.extLoaded[this.loader.type][this.type].html = this.options.html.valuePreloaded;
          }
        }
      }
    },

    /**
     * @require JsMethod > inheritMethod
     */
    __construct: function () {
      this.wjs.inheritMethod(this, '__construct', arguments);
      this.webPageInit();
    },

    /**
     * @require JsMethod > inheritMethod
     */
    __destruct: function () {
      this.wjs.inheritMethod(this, '__destruct', arguments);
      this.webPageExit();
    },

    webPageInit: function () {
      // To override...
    },

    webPageExit: function () {
      // To override...
    }
  });
}(WjsProto));
