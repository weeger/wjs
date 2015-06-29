(function (WjsProto) {
  'use strict';
  WjsProto.register('JsClass', 'Formula', {
    isFormula: true, // TODO
    eventTrigger: false,

    __construct: function () {
      if (this.eventTrigger) {
        // Proxy callback.
        this.updateEventProxy = this.updateEvent.bind(this);
        // Event name.
        this.eventNameUpdate = this.name + 'Update';
      }
    },

    updateEvent: function () {
      // Update a global event on change,
      // used by listener to update, ie. frame rendering.
      WjsProto.trigger(this.eventNameUpdate);
    },

    result: WjsProto._e
  });
}(WjsProto));
