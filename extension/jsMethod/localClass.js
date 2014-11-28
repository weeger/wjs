(function (loader) {
  'use strict';
  /**
   * Define class proto and create an instance
   * in the same time, useful for classes definition
   * created only once.
   */
  loader.methodAdd('localClass', function (name, proto) {
    this.classExtend(name, proto);
    return new (this.classProto(name))();
  });
}(loader));