/**
 * Custom debug shortcuts.
 * Replace console.log() by log(), etc...
 */
(function (W) {
  "use strict";
  // Define vars.
  var shortcuts = {
      log: 'log',
      error: 'err',
      debug: 'deb',
      warn: 'warn',
      info: 'info',
      trace: 'trace'
    }, i = 0, key, items = Object.keys(shortcuts),
    console = W.context.console, debugViewer,
    isMobile = (navigator.userAgent.match(/iPad/i) !== null);

  // Detect tablets.
  if (isMobile) {
    W.ready(function () {
      debugViewer = window.document.createElement('div');
      debugViewer.classList.add('debugViewer');
      window.document.body.appendChild(debugViewer);
    });
  }

  // Loop through shortcuts.
  while (key = items[i++]) {
    // Save shortcut functions.
    W.context[shortcuts[key]] = (function (key) {
      var base = function (msg) {
        return console[key](msg);
      };
      // Build a new custom function.
      if (isMobile) {
        return function (msg) {
          // Use custom viewer.
          debugViewer && (debugViewer.innerHTML += key + ' : ' + msg + '<br/>');
          // Also in console..
          base(msg);
        };
      }
      // Use console.
      return base;
    })(key);
  }
}(W));

