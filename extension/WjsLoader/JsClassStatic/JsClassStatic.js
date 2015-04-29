(function (WjsProto) {
  'use strict';
  // <--]
  WjsProto.register('WjsLoader', 'JsClassStatic', {
    loaderExtends: 'JsClass',

    __construct: function () {
      this.staticClasses = {};
      this.wjs.loaders.JsClass.__construct.call(this);
    },

    register: function (type, name, process, value) {
      var self = this,
      // Parent execute classExtend.
        output = self.wjs.loaders.JsClass.register.apply(self, arguments);
      // Create proto
      this.staticClasses[name] = new (self.wjs.classProto(name))();
      return output;
    }
  });
  // [-->
}(WjsProto));
