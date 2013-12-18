w.loader_add('javascript', {

  /**
   * Javascript are loaded via AJAX.
   */
  load: function (name, options) {
    // Override base function,
    // handle callback function in render process.
    this.load_ajax(name, options);
  },

  /**
   * Run AJAX call.
   */
  process: function (process, script) {
    process.get_script_ajax(this.type, script.name);
  },

  parse_javascript: function (name, value) {
    // If value is not a function, it came from
    // the not cached json response, so
    // we are forced to evaluate it.
    var is_function = $.isFunction(value);
    if (!is_function) {
      value = eval('(' + decodeURIComponent(value) + ')');
      // We evaluate it again.
      is_function = $.isFunction(value);
    }
    if (is_function) {
      // Mark as loaded before execute script.
      // Script may override saved data.
      w.collection(this.type, name, value);
      value();
    }
  }
});
