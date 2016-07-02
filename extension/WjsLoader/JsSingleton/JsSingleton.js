(function (W) {
  'use strict';
  W.register('WjsLoader', 'JsSingleton', {
    loaderExtends: 'JsClass',
    wjsShortcuts: true,

    register: function (type, name, process, value) {
      // Get method
      value = value || W.retrieve(this.type, name);
      // Extend prototype.
      this.w.classExtend(name, value);
      // Create proto
      this.items[name] = new (this.w.classProto(name))();
      // Activate.
      this.enable(name);
      // Continue parsing.
      // Allow child prototypes to force saved value.
      process.itemParseComplete(this.type, name, value);
    },

    destroy: function (name, data, process) {
      // Destruct class.
      if (this.items[name].__destruct) {
        this.items[name].__destruct();
      }
      // Remove entry.
      delete this.items[name];
      // Remove JsClass parts.
      return this.w.loaders.JsClass.destroy.call(this, name, data, process);
    }
  });
}(W));
