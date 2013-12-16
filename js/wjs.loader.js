/**
 * @file
 *
 * Defining different objects type to request need to
 * use specific core loader. This is the base object
 * constructor.
 */

/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, strict:true, browser:true, jquery:true, nomen:false */
/*global w*/

window.wjs_loader = $.inherit({
  __constructor: function (options) {
    var defaults = {
      type: 'undefined'
    };

    $.extend(defaults, options);
    $.extend(this, defaults);

    // Add an entry into we_javascript to save loaded scripts.
    if (!w.loaded.hasOwnProperty(this.type)) {
      w.loaded[this.type] = {};
    }

    w.loaders[this.type] = this;
  },

  /**
   * By default, load just execute complete callback,
   * it should be override by subclasses.
   */
  load: function (name, complete) {
    // Adjust options and complete callback.
    var options = w.extend_options(complete);
    // Execute complete.
    if (options.hasOwnProperty('complete')) {
      options.complete();
    }
  },

  unload: function (name, complete) {
    // Adjust options and complete callback.
    var options = w.extend_options(complete);
    // Delete internal reference.
    delete w.loaded[this.type][name];
    // Unload is always synchronous (no AJAX).
    if (options.hasOwnProperty('complete')) {
      options.complete();
    }
  },

  /**
   * Load a specified script type.
   */
  loading_process_launch: function (script_type, script_name, complete) {
    var i,
      script;
    // Reorganize options to get "complete" function at the root object,
    // and separate other data into "scripts" object.
    script = {
      type: script_type,
      name: script_name
    };

    for (i in complete) {
      if (complete.hasOwnProperty(i)) {
        // At this point, complete object should
        // always have "complete" key if function exists.
        if (i !== 'complete') {
          script[i] = complete[i];
          delete complete[i];
        }
      }
    }
    complete.scripts = [script];

    // Uses one function for all processes.
    return this.loading_process_launch_multiple(complete);
  },

  /**
   * Load all scripts defined into object.
   */
  loading_process_launch_multiple: function (options) {
    // Create a new loading process.
    return new window.wjs_process(w.extend_options(options));
  },

  load_ajax: function (name, options) {
    var item;
    // Adjust options and complete callback.
    options = w.extend_options(options);
    // Search into not parsed content in result is already loaded.
    item = w.process_parse_queue_get(this.type, name);
    if (item !== false) {
      item.process.parse_item(this.type, name, item.value);
    }
    // Launch request process.
    else {
      this.loading_process_launch(this.type, name, options);
    }
  },

  /**
   * Load .js script file.
   */
  get_script: function (url) {

    // Get script file asynchronously.
    $.ajax({
      url: url,
      dataType: "script",
      async: false
    });
  },

  /**
   * Defines what to do when processing each script.
   */
  process: function (name, options) {
    // This function should be extended.
  },

  /**
   * Defines what to do with loaded script data.
   */
  parse: function (name, data) {
    var i, j;
    // If data is string, script
    // is a path of cached file.
    if (typeof data === 'string' && data.indexOf('cache://') === 0) {
      this.get_script(data.replace('cache://', w.settings.path_root));
      return;
    }
    // Load required elements first.
    if (data.hasOwnProperty('#require')) {
      for (i in data['#require']) {
        if (data['#require'].hasOwnProperty(i)) {
          for (j in data['#require'][i]) {
            if (data['#require'][i].hasOwnProperty(j)) {
              w.load(i, data['#require'][i][j]);
            }
          }
        }
      }
    }
    // Parse content with specific functions.
    for (i in data) {
      if (data.hasOwnProperty(i) && $.isFunction(this['parse_' + i])) {
        this['parse_' + i](name, data[i]);
      }
    }
    // This function may be extended.
    // In all case it should remove data from parse queue.
    w.process_parse_queue_remove(this.type, name);
  }
});