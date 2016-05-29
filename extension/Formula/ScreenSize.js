(function (W) {
  'use strict';
  W.register('Formula', 'ScreenSize', {
    eventTrigger: true,
    directions: {
      width: 'innerWidth',
      height: 'innerHeight'
    },

    initFormula: function () {
      this.w.window.addEventListener('resize', this.updateEventProxy);
    },

    exitFormula: function () {
      this.w.window.removeEventListener('resize', this.updateEventProxy);
    },

    result: function (formula) {
      return window[this.directions[formula.direction]];
    }
  });
}(W));
