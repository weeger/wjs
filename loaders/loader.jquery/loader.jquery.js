/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, strict:true, browser:true, jquery:true, nomen:false */
/*global w,jQuery*/
w.loader_add('jquery', {
  base: 'javascript',
  __constructor: function (options) {
    "use strict";
    this.__base(options);
    var i, name;
    // Init jQuery.xxx() functions.
    for (i in w.settings.jquery_plugins) {
      if (w.settings.jquery_plugins.hasOwnProperty(i)) {
        name = w.settings.jquery_plugins[i];
        // Create an empty jQuery plugin
        // Just to handle call, and query by ajax.
        jQuery[name] = this.callback_generate(name);
      }
    }
  },

  parse_jquery: function (name, value) {
    "use strict";
    this.parse_javascript(name, value);
  },

  callback_generate: function (name) {
    "use strict";
    return $.proxy(function (name) {
      // Prevent recursion if loading failed.
      if (!w.collection('jquery', name)) {
        // Call will replace plugin function by real one.
        w.load('jquery', name);
        return $[name].apply($, arguments);
      }
    }, this);
  }
});
