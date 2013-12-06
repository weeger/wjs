/**
 * json contain the data of ajax response.
 */
w.loader_add('json', {

  load: function (name, options) {
    // We can use load_json with no name. In this case
    // options is never undefined due to extend_options,
    // but it can be empty.
    if (typeof name === 'object') {
      // Adjust options and complete callback.
      var options = w.extend_options(options);
      options.data = name;
      name = 'json_anonymous';
      // Create loading process.
      this.loading_process_launch(this.type, name, options);
    }
    else {
      this.load_ajax(name, options);
    }
  },

  /**
   * Parse json content only,
   * like an AJAX package.
   */
  process: function (process, script) {
    if (script.name === 'json_anonymous') {
      // Start process.
      var loading_queue_id = process.loading_queue_append();
      // Parse.
      if ('data' in script) {
        process.parse(script.data);
      }
      // Stop process.
      process.loading_queue_complete(loading_queue_id, [script.data]);
    }
    else {
      process.get_script_ajax(this.type, script.name);
    }
  },

  parse_json: function (name, value) {
    w.collection(this.type, name, value);
  }
});
