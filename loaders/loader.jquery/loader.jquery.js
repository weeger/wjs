w.loader_add('jquery', {
  base: 'javascript',
  __constructor: function (options) {
    this.__base(options);
    // Init jQuery.xxx() functions.
    for (var i in w.settings.jquery_plugins) {
      var name = w.settings.jquery_plugins[i];
      // Create an empty jQuery plugin
      // Just to handle call, and query by ajax.
      jQuery[name] = $.proxy(function () {
        // Prevent recursion if loading failed.
        if (!w.collection('jquery', name)) {
          // Call will replace plugin function by real one.
          w.load('jquery', name);
          return $[name].apply($, arguments);
        }
      }, this);
    }
  },

  parse_jquery: function (name, value) {
    this.parse_javascript(name, value);
  }
});
