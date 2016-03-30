(function (WjsProto) {
  'use strict';
  /**
   * @from https://developer.mozilla.org/fr/docs/Web/CSS/CSS_Animations/Detecting_CSS_animation_support
   */
  WjsProto.register('JsMethod', 'cssAnimationSupported', function () {
    var elm = document.createElement('div'),
      domPrefixes = 'Webkit Moz O ms Khtml'.split(' ');
    if (elm.style.animationName === undefined) {
      for (var i = 0; i < domPrefixes.length; i++) {
        if (elm.style[domPrefixes[i] + 'AnimationName'] !== undefined) {
          return true;
        }
      }
    }
    return true;
  });
}(WjsProto));
