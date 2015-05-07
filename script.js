(function (context) {
  'use strict';

  /**
   * Place a normal script when document is ready.
   * @re quire Audio > wjs-latest.ogg
   * @require JsMethod > wjsIncludeInit
   */
  context.WjsProto.ready(function () {
    // Search for <wjs-include> tags.
    this.wjsIncludeInit(this.window.document.body);
    // You can place extra javascript here
    // after the main site initialisation.
    // You can also add you scripts by the
    // classic way (outside this function).
//    var audio = this.get('Audio', 'wjs-latest.ogg');
//    audio.volume = .2;
//    if (audio.loop !== undefined) {
//      audio.loop = true;
//    }
//    else {
//      audio.addEventListener('ended', function () {
//        audio.play();
//      });
//    }
//    audio.play();
  });

  // Debug tool
  context.log = function (message) {
    console.log(message);
  }

}(this));
