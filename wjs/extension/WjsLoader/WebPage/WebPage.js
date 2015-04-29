(function (WjsProto) {
  'use strict';
  // <--]
  WjsProto.register('WjsLoader', 'WebPage', {
    loaderExtends: 'WebComp',
    pageCurrent: null,

    parse: function (name, value, process) {
      var self = this;
      // Save page as current open.
      self.pageCurrent = name;
      // Use normal web comp.
      return this.wjs.loaders.WebComp.parse.call(this, name, value, process);
    },

    link: function (name) {
      var self = this;
      // If page change.
      if (name !== self.pageCurrent) {
        // destroy current.
        if (self.pageCurrent) {
          self.wjs.destroy(self.type, self.pageCurrent, {
            dependencies: true,
            complete: function () {
              self.pageCurrent = null;
              self.link(name);
            }
          });
          return;
        }
        self.wjs.use(self.type, name);
      }
    }
  });
  // [-->
}(WjsProto));
