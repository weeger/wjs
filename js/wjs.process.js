/**
 * @file
 * Loading process.
 * we_javascript allow to load multiple loading process
 * Each process can load a script or a collection of different scripts
 * and can execute a "complete" callback when finished.
 * This is useful when loading is asynchronous and allows
 * to launch several processes separately.
 */
(function (wjs) {
  'use strict';
  // <--]
  wjs.process = function (options, w) {
    var i;
    // Default values
    this.async = false;
    this.loading_queue = {};
    this.started = false;
    this.w = w;
    this.w.extend(this, options);
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
  };

  wjs.process.prototype = {
    scripts: [],
    /**
     * Call w, add loading queue management,
     * and create a callback function
     * to parse JSON response.
     */
    script_ajax: function (script_type, script_name) {
      // Load remote scripts.
      var loading_queue_id = this.loading_queue_append(),
        query = {
          t: script_type,
          s: script_name
        },
        url;
      // If extra query strings are defined into w settings,
      // append it to url.
      if (this.w.transcode.transcoded_variable('client', 'load_url_queries')) {
        this.w.extend(query, this.w.transcode.transcoded_variable('client', 'load_url_queries'));
      }
      // Create url.
      url = this.w.url(this.w.transcode.path('client', 'wjs_response'), {query: query});
      // Launch AJAX call.
      this.w.ajax({
        url: url,
        method: 'GET',
        async: this.async,
        success: function (data) {
          // Do not use hasOwnProperty for ie11 support.
          if (data.responseText) {
            // Returned content is always json wrapped.
            this.parse(JSON.parse(data.responseText));
          }
          // loading_complete will be called if
          // loading_queue_complete is the last one.
          this.loading_queue_complete(loading_queue_id, [data]);
        }.bind(this),
        error: function (data) {
          // We may need to tests connection using this value.
          if (data.responseText !== 'false_positive') {
            this.w.error('Failed to retrieve w data from server : ' + data.responseText);
          }
          // Close process even error happen.
          this.loading_queue_complete(loading_queue_id, [data]);
        }.bind(this)
      });
    },

    /**
     * Parse JSON response.
     */
    parse: function (data) {
      var i, collection, name;
      if (data.hasOwnProperty('transcoded_data')) {
        this.w.extend(true, this.w.transcoded_data, data.transcoded_data);
        delete data.transcoded_data;
      }
      // Append script to loading process.
      this.w.process_parse_queue_add(data, this);
      // Pass trough each kind of data.
      // Returned package contain different types
      // of data grouped by loader type.
      for (i in this.w.core_loaders) {
        if (this.w.core_loaders.hasOwnProperty(i)) {
          collection = this.w.core_loaders[i];
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
      if (!this.w.process_parse_queue_is_empty(this)) {
        this.w.error('Loading process queue not empty after parsing data.');
      }
    },

    parse_item: function (collection, name, data) {
      // Parse using matching loader.
      if (!this.w.collection(collection, name)) {
        this.w.loader(collection).parse(name, data);
      }
      // If already loaded, remove to queue.
      else {
        this.w.process_parse_queue_remove(collection, name);
      }
    },

    /**
     * Add step to complete by this loading process.
     */
    loading_queue_append: function () {
      if (this.started === false) {
        // Trigger event only on first start.
        this.w.event('wjs_process_start', this.w.document);
      }
      this.started = true;
      // Create a unique ID.
      var id = this.w.object_size(this.loading_queue) + 1;
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
      if (typeof this.complete === 'function') {
        // Pass complete arguments.
        this.complete.apply(this.complete, complete_arguments);
      }
      this.started = false;
      // Remove this element from processes.
      this.w.array_delete(this.w.processes, this);
      // Event.
      this.w.event('wjs_process_complete', this.w.document);
    }
  };
  // [-->
}(wjs));