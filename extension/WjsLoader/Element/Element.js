/**
 * @require WjsLoader > Binder
 * @require JsScript > SchemeElement
 */
(function (W) {
  'use strict';
  W.register('WjsLoader', 'Element', {
    loaderExtends: 'Binder',
    protoBaseClass: 'Element',
    stageDefault: null,

    stageDefaultCreate: function (domDestination) {
      // One global stage only.
      if (!this.stageDefault) {
        this.stageDefault = this.instance('Stage', {
          // Allow to change destination.
          domDestination: domDestination
        });
      }
      return this.stageDefault;
    }
  });
}(W));
