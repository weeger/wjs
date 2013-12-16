w.loader_add('javascript', {

  /**
   * Javascript are loaded via AJAX.
   */
  load: function (name, options) {
    this.load_ajax(name, options);
  },

  /**
   * Run AJAX call.
   */
  process: function (process, script) {
    process.get_script_ajax(this.type, script.name);
  },

  parse_javascript: function (name, value) {
    if ($.isFunction(value)) {
      // Script need to be evaluated.
      // Mark as loaded before execute script.
      // Script may override saved data.
      w.collection(this.type, name, value);
      value();
    }
  }
});