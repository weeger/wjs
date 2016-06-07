(function (W) {
  'use strict';
  W.register('JsClass', 'Formula', {
    eventTrigger: false,

    __construct: function () {
      if (this.eventTrigger) {
        // Proxy callback.
        this.updateEventProxy = this.updateEvent.bind(this);
        // Event name.
        this.eventNameUpdate = this.name + 'Update';
      }
    },

    init: W._e,

    exit: W._e,

    updateEvent: function () {
      // Update a global event on change,
      // used by listener to update, ie. frame rendering.
      W.trigger(this.eventNameUpdate);
    },

    result: W._e
  });
}(W));
