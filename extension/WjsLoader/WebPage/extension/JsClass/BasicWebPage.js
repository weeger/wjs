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
        defaults: false,
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
      }
    }
  });
}(WjsProto));
