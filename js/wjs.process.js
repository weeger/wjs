/**
 * @file
 * Loading process.
 * we_javascript allow to load multiple loading process
 * Each process can load a script or a collection of different scripts
 * and can execute a "complete" callback when finished.
 * This is useful when loading is asynchronous and allows
 * to launch several processes separately.
 */

/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, strict:true, browser:true, jquery:true, nomen:false */
/*global w*/

"use strict";
window.wjs_process = $.inherit({

  __constructor: function (options) {
    var i;
    // Default values
    this.async = false;
    this.loading_queue = {};
    this.started = false;
    $.extend(this, options);
    // Save it into w.
    w.processes.push(this);
    // Process.
    for (i in this.scripts) {
      // Check if loader exists.
      if (this.scripts.hasOwnProperty(i) && w.loaders.hasOwnProperty(this.scripts[i].type)) {
        // Run process hook into core loader object of this type of script.
        w.loader(this.scripts[i].type).process(this, this.scripts[i]);
      }
    }
  },

  /**
   * Call w, add loading queue management,
   * and create a callback function
   * to parse JSON response.
   */
  get_script_ajax: function (script_type, script_name) {
    // Load remote scripts.
    var loading_queue_id = this.loading_queue_append(),
    // Get url.
      query = {},
      url;
    // Set default query settings.
    $.extend(query, w.settings.path_response_query, {
      t: script_type,
      s: script_name
    });

    url = w.url(w.settings.path_response, {query: query});
    // Launch AJAX call.
    $.ajax({
      url: url,
      async: this.async,
      success: $.proxy(function (data) {
        if (data) {
          // Returned content is always json wrapped.
          data = jQuery.parseJSON(data);
          this.parse(data);
        }
        // loading_complete will be called if
        // loading_queue_complete is the last one.
        this.loading_queue_complete(loading_queue_id, [data]);
      }, this),
      error: $.proxy(function (data) {
        if (data.responseText !== 'false_negative') {
          throw new Error('Failed to retrieve w data from server : ' + data.responseText);
        }
        // Close process even error happen.
        this.loading_queue_complete(loading_queue_id, [data]);
      }, this)
    });
  },

  /**
   * Parse JSON response.
   */
  parse: function (data) {
    var i, collection, name;
    // Append script to loading process.
    w.process_parse_queue_add(data, this);
    // Pass trough each kind of data.
    // Returned package contain different types
    // of data grouped by loader type.
    for (i in w.core_loaders) {
      if (w.core_loaders.hasOwnProperty(i)) {
        collection = w.core_loaders[i];
        if (data.hasOwnProperty(collection)) {
          for (name in data[collection]) {
            if (data[collection].hasOwnProperty(name)) {
              this.parse_item(collection, name, data[collection][name]);
            }
          }
        }
      }
    }
    // At the end of loading, queue must be empty.
    // If not, may be an unknown script is present in
    // the returned package.
    if (!w.process_parse_queue_is_empty(this)) {
      throw new Error('Loading process queue not empty after parsing data.');
    }
  },

  parse_item: function (collection, name, data) {
    // Parse using matching loader.
    if (!w.collection(collection, name)) {
      w.loader(collection).parse(name, data);
    }
    // If already loaded, remove to queue.
    else {
      w.process_parse_queue_remove(collection, name);
    }
  },

  /**
   * Add step to complete by this loading process.
   */
  loading_queue_append: function () {

    if (this.started === false) {
      // Trigger event only on first start.
      w.$_body.trigger('we_javascript_loading_process_start', [this]);
    }
    this.started = true;
    // Create a unique ID.
    var id = w.object_size(this.loading_queue) + 1;
    // Save
    this.loading_queue[id] = true;

    return id;

  },

  /**
   * Mark step as completed, and close process if last one.
   */
  loading_queue_complete: function (id, complete_arguments) {
    var i;
    delete this.loading_queue[id];
    // Don't close queue until all loadings are not finished.
    for (i in this.loading_queue) {
      if (this.loading_queue.hasOwnProperty(i)) {
        return;
      }
    }
    this.loading_complete(complete_arguments);
  },

  loading_complete: function (complete_arguments) {
    // Execute complete callback.
    if ($.isFunction(this.complete)) {
      // Pass complete arguments.
      this.complete.apply(this.complete, complete_arguments);
    }

    this.started = false;
    // Remove this element from processes.
    w.array_delete(w.processes, this);
    // Event.
    w.$_body.trigger('we_javascript_loading_process_complete', [this]);
  }
});
