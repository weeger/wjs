/**
 * @file
 *
 * wJs | Core of wJs.
 * Romain WEEGER 2010 / 2014
 */

/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, strict:true, browser:true, jquery:true, nomen:false */
/*global w*/

/**
 * Only one instance of this object is created per page.
 * Contain global javascript tools and helpers functions.
 */
var wjs = function () {
  "use strict";
  $.extend(true, this, this.defaults);
};

wjs.prototype = {
  defaults: {
    version: '[$version]',
    core_loaders: [],
    ready_functions: [],
    started: false,
    processes: [],
    default_package: {},
    loaders: {},
    loaders_prototypes: {},
    loaded: {},
    loader_path: '',
    settings: {
      path_core: '',
      path_root: ''
    },
    loading_process_parse_queue: {}
  },

  /**
   * Create basics elements to interact with the document.
   * Must be executed when document is ready.
   */
  init: function (options) {
    "use strict";
    // Apply default vars.
    $.extend(true, this, this.defaults);
    $.extend(true, this, options);
    // Keep reference to document body.
    this.$_body = $('body:first');
    // Execute base javascript loader.
    eval('(' + this.default_package.javascript['loader.javascript'].javascript + ')();');
    // Load all other scripts the run ready functions.
    this.unpack(this.default_package, $.proxy(function () {
      // Execute startup functions.
      this.ready_complete();
    }, this));
  },

  load: function (collection, name, complete) {
    "use strict";
    if (!this.collection(collection, name)) {
      this.loader(collection).load(name, complete);
    }
  },

  unload: function (collection, name, complete) {
    "use strict";
    if (this.collection(collection, name)) {
      this.loader(collection).unload(name, complete);
    }
  },

  /**
   * Because w must execute loading request on startup,
   * he needs his own ready function.
   * We may merge this function with the jQuery ready function if we
   * found a way to contruct the $we object before.
   */
  ready: function (callback) {
    "use strict";
    if (this.started === true) {
      callback();
    }
    else {
      this.ready_functions.push(callback);
    }
  },

  /**
   * Execute all "ready" functions.
   * Called by we_javascript_footer().
   */
  ready_complete: function () {
    "use strict";
    var i;
    // Mark as started, further ready functions
    // will be executed directly.
    this.started = true;
    for (i in this.ready_functions) {
      if (this.ready_functions.hasOwnProperty(i)) {
        this.ready_functions[i]();
      }
    }
  },

  /**
   * Parse json data.
   * Used when data is not loaded by AJAX.
   * Basically as document startup.
   */
  unpack: function (data, complete) {
    "use strict";
    this.load('json', data, complete);
  },

  /**
   * Return true if element is loaded.
   */
  loader: function (name) {
    "use strict";
    if (!this.loaders.hasOwnProperty(name) && this.core_loaders.indexOf(name) !== -1) {
      this.loader('javascript').parse('loader.' + name, this.default_package.javascript['loader.' + name]);
    }

    return this.loaders[name];
  },

  loader_add: function (name, loader_object) {
    "use strict";
    if (!this.loaders.hasOwnProperty(name)) {
      loader_object.name = name;
      // Create prototype from object.
      // If base exists, use base prototype.
      var base = (loader_object.hasOwnProperty('base')) ? this.loaders_prototypes[loader_object.base] : window.wjs_loader,
      // Save internally.
        prototype = $.inherit(base, loader_object);
      this.loaders_prototypes[name] = prototype;
      this.loaders[name] = new prototype({type: name});
    }

    return this.loaders[name];
  },

  /**
   * Save data in loaded collections.
   */
  collection: function (type, name, data) {
    "use strict";
    // Fill variable id data exist.
    if (data !== undefined) {
      this.loaded[type][name] = data;
    }
    // Return value if defined.
    return ((this.loaded.hasOwnProperty(type)) && (this.loaded[type].hasOwnProperty(name))) ? this.loaded[type][name] : false;
  },

  /**
   * Use a global parse queue to allow loaded scripts
   * to access to other ones, loaded before of after itself.
   * It prevent to reload script who are already loaded
   * but not parsed.
   */
  process_parse_queue_add: function (data, process) {
    "use strict";
    var collection,
      item;

    for (collection in data) {
      if (data.hasOwnProperty(collection)) {
        // Create object if missing.
        if (!this.loading_process_parse_queue.hasOwnProperty(collection)) {
          this.loading_process_parse_queue[collection] = {};
        }
        for (item in data[collection]) {
          if (data[collection].hasOwnProperty(item)) {
            this.loading_process_parse_queue[collection][item] = {value: data[collection][item], process: process};
          }
        }
      }
    }
  },

  process_parse_queue_is_empty: function (process) {
    "use strict";
    var i, j;

    for (i in this.loading_process_parse_queue) {
      if (this.loading_process_parse_queue.hasOwnProperty(i)) {
        for (j in this.loading_process_parse_queue[i]) {
          if (this.loading_process_parse_queue[i].hasOwnProperty(j) && this.loading_process_parse_queue[i][j].process === process) {
            return false;
          }
        }
      }
    }
    return true;
  },

  process_parse_queue_get: function (collection, item) {
    "use strict";
    if ((this.loading_process_parse_queue.hasOwnProperty(collection)) && (this.loading_process_parse_queue[collection].hasOwnProperty(item))) {
      return this.loading_process_parse_queue[collection][item];
    }
    return false;
  },

  /**
   * Remove each loaded script separately.
   */
  process_parse_queue_remove: function (collection, item) {
    "use strict";
    if (this.loading_process_parse_queue.hasOwnProperty(collection)) {
      delete this.loading_process_parse_queue[collection][item];
      // Cleanup object.
      if (this.object_size(this.loading_process_parse_queue[collection]) === 0) {
        delete this.loading_process_parse_queue[collection];
      }
    }
  },

  /**
   * Convert user passed options to object.
   */
  extend_options: function (options, extra) {
    "use strict";
    // If options is a function, this is the "complete" callback.
    if ($.isFunction(options)) {
      options = {
        complete: options
      };
    }

    // If extra is a function turn it to an object.
    if ($.isFunction(extra)) {
      extra = {
        complete: extra
      };
    }

    return $.extend(options, extra);
  },

  /**
   * Create url needed for scripts loading.
   */
  url: function (script_path, settings) {
    "use strict";
    var url = script_path;

    if (settings === undefined || !(settings.hasOwnProperty('file')) || settings.file !== true) {
      url = this.loader_path + url;
    }

    if (settings !== undefined && settings.hasOwnProperty('absolute') && settings.absolute) {
      return window.location.origin + '/' + url;
    }
    return url;
  },

  /**
   * Remove object from array.
   */
  array_delete: function (array, item) {
    "use strict";
    var index = array.indexOf(item);
    return this.array_delete_index(array, index);
  },

  /**
   * Remove element by index from array.
   */
  array_delete_index: function (array, index) {
    "use strict";
    if (index !== -1) {
      array.splice(index, 1);
    }
    return array;
  },

  /**
   * Return length of object.
   */
  object_size: function (object) {
    "use strict";
    var size = 0, key;
    for (key in object) {
      if (object.hasOwnProperty(key)) {
        size += 1;
      }
    }
    return size;
  }
};

// Create w object.
// Core is not initialised now but into page footer.
window.w = new wjs();

