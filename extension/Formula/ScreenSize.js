(function (W) {
  'use strict';
  W.register('Formula', 'ScreenSize', {
    eventTrigger: true,
    directions: {
      width: 'innerWidth',
      height: 'innerHeight'
    },

    init: function () {
      this.w.window.addEventListener('resize', this.updateEventProxy);
    },

    exit: function () {
      this.w.window.removeEventListener('resize', this.updateEventProxy);
    },

    result: function (formula) {
      return window[this.directions[formula.direction]];
    }
  });
}(W));
