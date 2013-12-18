/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, strict:true, browser:true, jquery:true, nomen:false */
/*global w,jQuery*/
w.loader_add('javascript', {

  /**
   * Javascript are loaded via AJAX.
   */
  load: function (name, options) {
    "use strict";
    // Override base function,
    // handle callback function in render process.
    this.load_ajax(name, options);
  },

  /**
   * Run AJAX call.
   */
  process: function (process, script) {
    "use strict";
    process.get_script_ajax(this.type, script.name);
  },

  parse_javascript: function (name, value) {
    "use strict";
    // If value is not a function, it came from
    // the not cached json response, so
    // we are forced to evaluate it.
    var is_function = $.isFunction(value),
    // We use eval callback to keep strict mode.
      eval_callback = eval;
    if (!is_function) {
      value = eval_callback('(' + decodeURIComponent(value) + ')');
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
