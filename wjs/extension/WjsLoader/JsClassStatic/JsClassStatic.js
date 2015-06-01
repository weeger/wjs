(function (WjsProto) {
  'use strict';
  WjsProto.register('WjsLoader', 'JsClassStatic', {
    loaderExtends: 'JsClass',

    __construct: function () {
      this.staticClasses = {};
      this.wjs.loaders.JsClass.__construct.call(this);
    },

    enable: function (name, value) {
      this.wjs.loaders.JsClass.enable.apply(this, arguments);
      // TODO this.wjs[name] =
    },

    register: function (type, name, process, value) {
      // Parent execute classExtend.
      var output = this.wjs.loaders.JsClass.register.apply(this, arguments);
      // Create proto
      this.wjs[name] =
        this.staticClasses[name] = new (this.wjs.classProto(name))();
      return output;
    }
  });
}(WjsProto));
