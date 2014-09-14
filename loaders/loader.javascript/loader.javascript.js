(function (wjs) {
  'use strict';
  // <--]
  wjs.loader_add('javascript', {
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
      process.script_ajax(this.type, script.name);
    },

    parse_javascript: function (name, value) {
      // If value is not a function, it came from
      // the not cached json response, so
      // we are forced to evaluate it.
      var is_function = typeof value === 'function',
      // We use eval callback to keep strict mode.
        eval_callback = eval;
      if (!is_function) {
        value = eval_callback('(' + value + ')');
        // We test it again, now it may be a function.
        is_function = typeof value === 'function';
      }
      if (is_function) {
        // Mark as loaded before execute script.
        // Script may override saved data.
        this.w.collection(this.type, name, value);
        value();
      }
    }
  });
  // [-->
}(wjs));
