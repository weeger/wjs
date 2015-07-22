(function (WjsProto) {
  'use strict';
  WjsProto.register('Formula', 'ScreenSize', {
    eventTrigger: true,
    directions: {
      width: 'innerWidth',
      height: 'innerHeight'
    },

    initFormula: function () {
      this.wjs.window.addEventListener('resize', this.updateEventProxy);
    },

    exitFormula: function () {
      this.wjs.window.removeEventListener('resize', this.updateEventProxy);
    },

    result: function (formula) {
      return window[this.directions[formula.direction]];
    }
  });
}(WjsProto));
