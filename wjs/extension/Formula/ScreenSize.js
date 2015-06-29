(function (WjsProto) {
  'use strict';
  WjsProto.register('Formula', 'ScreenSize', {
    directions: {
      width: 'innerWidth',
      height: 'innerHeight'
      // TODO onresize ?
    },

    result: function (formula) {
      return window[this.directions[formula.direction]];
    }
  });
}(WjsProto));
