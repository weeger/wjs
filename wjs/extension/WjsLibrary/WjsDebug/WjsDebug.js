(function (context) {
  "use strict";
  var console = context.console;
  // Set debug shorthands functions.
  context.log = function (msg) {
    console.log(msg);
  };

  context.err = function (msg) {
    console.error(msg);
  };

  context.deb = context.d = function (msg) {
    console.debug(msg);
  };

  context.warn = function (msg) {
    console.warn(msg);
  };
}(this));

