(function (context) {
  'use strict';
  // <--]
  context.wjs.loaderAdd('WebPage', {
    classExtends: 'WjsLoaderWebComp',
    pageCurrent: null,
    link: function (name) {
      var self = this;

      if (name !== self.pageCurrent) {
        if (self.pageCurrent) {
          self.wjs.destroy(self.type, self.pageCurrent, {
            dependencies: true,
            complete: function () {
              self.pageCurrent = null;
              self.link(name);
            }
          });
        }
        self.pageCurrent = name;
        self.wjs.use(self.type, self.pageCurrent, function () {

        });
      }
    }
  });
  // [-->
}(wjsContext));
