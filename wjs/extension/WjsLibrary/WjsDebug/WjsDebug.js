(function (context) {
  "use strict";
  var console = context.console, debugViewer;

  // Detect tablets.
  if (navigator.userAgent.match(/iPad/i) !== null) {
    context.WjsProto.ready(function () {
      debugViewer = window.document.createElement('div');
      debugViewer.style.fontSize = '10px';
      debugViewer.style.fontFamily = 'Verdana';
      debugViewer.style.margin = '5px';
      debugViewer.style.padding = '5px';
      debugViewer.style.background = 'rgba(0,0,0,.2)';
      debugViewer.style.width = '300px';
      debugViewer.style.height = '200px';
      debugViewer.style.overflow = 'scroll';
      debugViewer.style.zIndex = 10000;
      debugViewer.innerHTML = 'Debug for tablet...';
      window.document.body.appendChild(debugViewer);
    });
  }

  // Set debug shorthands functions.
  context.log = function (msg) {
    console.log(msg);
    if (debugViewer) {
      debugViewer.innerHTML += '<br/>log ' + msg;
    }
  };

  context.err = function (msg) {
    console.error(msg);
    if (debugViewer) {
      debugViewer.innerHTML += '<br/>err ' + msg;
    }
  };

  context.deb = context.d = function (msg) {
    console.debug(msg);
    if (debugViewer) {
      debugViewer.innerHTML += '<br/>deb ' + msg;
    }
  };

  context.warn = function (msg) {
    console.warn(msg);
    if (debugViewer) {
      debugViewer.innerHTML += '<br/>warn ' + msg;
    }
  };

  context.info = function (msg) {
    console.info(msg);
    if (debugViewer) {
      debugViewer.innerHTML += '<br/>info ' + msg;
    }
  };
}(this));

