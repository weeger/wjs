(function (WjsProto) {
  'use strict';
  WjsProto.register('WjsLoader', 'JsClassStatic', {
    loaderExtends: 'JsClass',
    wjsShortcuts: true,

    register: function (type, name, process, value) {
      // Get method
      value = value || WjsProto.retrieve(this.type, name);
      // Extend prototype.
      this.wjs.classExtend(name, value);
      // Create proto
      this.items[name] = new (this.wjs.classProto(name))();
      // Activate.
      this.enable(name);
      // Continue parsing.
      // Allow child prototypes to force saved value.
      process.itemParseComplete(this.type, name, value);
    },

    destroy: function (name, data, process) {
      err(this.type + ' >>> ' + name);
      // Destruct class.
      if (this.items[name].__destruct) {
        this.items[name].__destruct();
      }
      // Remove entry.
      delete this.items[name];
      // Remove JsClass parts.
      return this.wjs.loaders.JsClass.destroy.call(this, name, data, process);
    }
  });
}(WjsProto));
