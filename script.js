(function (win) {
  'use strict';

  // Place a normal script when document is ready,
  // And before wjs initialization.
  win.addEventListener('load', function () {
    // Add buttons with javascript,
    // the goal is to hide these links to search engine.
    // The displayed text into search engine should be only
    // the main page title and subtitle.
    if (!(/bot|googlebot|crawler|spider|robot|crawling/i.test(win.navigator.userAgent))) {
      win.document.getElementById('main-content').innerHTML +=
        '<a id="previous" class="disabled" href="javascript:void(0);">&lt;&lt; previous</a>' +
          '<a id="next" class="disabled" href="javascript:void(0);">next &gt;&gt;</a>';
    }
  });

  win.wjs.ready(function () {
    // You can place extra javascript here
    // after the main site initialisation.
    // You can also add you scripts by the
    // classic way (outside this function)
    // if you know what you do.

  });
}(window));