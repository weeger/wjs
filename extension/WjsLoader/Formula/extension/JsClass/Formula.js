(function (WjsProto) {
  'use strict';
  WjsProto.register('JsClass', 'Formula', {
    eventTrigger: false,

    __construct: function () {
      if (this.eventTrigger) {
        // Proxy callback.
        this.updateEventProxy = this.updateEvent.bind(this);
        // Event name.
        this.eventNameUpdate = this.name + 'Update';
      }
      this.initFormula();
    },

    __destruct: function () {
      this.exitFormula();
    },

    initFormula: WjsProto._e,

    exitFormula: WjsProto._e,

    updateEvent: function () {
      // Update a global event on change,
      // used by listener to update, ie. frame rendering.
      WjsProto.trigger(this.eventNameUpdate);
    },

    result: WjsProto._e
  });
}(WjsProto));
