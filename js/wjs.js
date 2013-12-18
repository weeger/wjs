/**
 * wJs
 *
 * Romain WEEGER 2010 / 2014
 * Licensed under the MIT and GPL licenses :
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */

/*jshint bitwise:true, curly:true, eqeqeq:true, forin:true, noarg:true, noempty:true, nonew:true, undef:true, strict:true, browser:true, jquery:true, nomen:false */
/*global w,jQuery*/

/**
 * Only one instance of this object is created per page.
 * Contain global javascript tools and helpers functions.
 */
(function () {
  "use strict";

  var wjs = function () {
    // On construction, extends default values to object.
    jQuery.extend(true, this, this.defaults);
  };

  wjs.prototype = {
    defaults: {
      client_only: true,
      version: '[$version]',
      core_loaders: [],
      ready_functions: [],
      started: false,
      processes: [],
      default_package: {},
      loaders: {},
      loaders_prototypes: {},
      loaded: {},
      settings: {
        path_cache: '',
        // Response path should be customized,
        // to define some security parameters
        // when receiving queries and retrieving
        // data, depending of site configuration.
        path_response: 'path_to_response.php',
        path_response_query: {}
      },
      loading_process_parse_queue: {}
    },

    /**
     * Create basics elements to interact with the document.
     * Must be executed when document is ready.
     */
    init: function (options) {
      // Apply default vars.
      jQuery.extend(true, this, this.defaults);
      jQuery.extend(true, this, options);
      var loader_name;
      // Keep reference to document body.
      this.$_body = jQuery('body:first');
      // Create loaders prototypes.
      for (loader_name in this.loaders_prototypes) {
        if (this.loaders_prototypes.hasOwnProperty(loader_name)) {
          this.loaders[loader_name] = new this.loaders_prototypes[loader_name]({type: loader_name});
        }
      }
      // Load all other scripts then run ready functions.
      this.unpack(this.default_package, jQuery.proxy(function () {
        // Execute startup functions.
        this.ready_complete();
      }, this));
    },

    load: function (collection, name, complete) {
      if (!this.collection(collection, name)) {
        this.loader(collection).load(name, complete);
      }
    },

    unload: function (collection, name, complete) {
      if (this.collection(collection, name)) {
        this.loader(collection).unload(name, complete);
      }
    },

    /**
     * Because w must execute loading request on startup,
     * he needs his own ready function.
     * We may merge this function with the jQuery ready function if we
     * found a way to construct the w object before it.
     */
    ready: function (callback) {
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
      this.load('json', data, complete);
    },

    /**
     * Return true if element is loaded.
     */
    loader: function (name) {
      if (!this.loaders.hasOwnProperty(name) && this.core_loaders.indexOf(name) !== -1) {
        this.loader('javascript').parse('loader.' + name, this.default_package.javascript['loader.' + name]);
      }

      if (!this.loaders.hasOwnProperty(name)) {
        throw new Error('wjs : Try to get undefined loader "' + name + '"');
      }

      return this.loaders[name];
    },

    loader_add: function (name, loader_object) {
      if (!this.loaders.hasOwnProperty(name)) {
        loader_object.name = name;
        // Create prototype from object.
        // If base exists, use base prototype.
        var base = (loader_object.hasOwnProperty('base')) ? this.loaders_prototypes[loader_object.base] : window.wjs_loader;
        // Save internally.
        this.loaders_prototypes[name] = jQuery.inherit(base, loader_object);
        // Create instance if w is already started.
        if (this.started === true) {
          this.loaders[name] = new this.loaders_prototypes[name]({type: name});
        }
      }
      return this.loaders[name];
    },

    /**
     * Save data in loaded collections.
     */
    collection: function (type, name, data) {
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
      if ((this.loading_process_parse_queue.hasOwnProperty(collection)) && (this.loading_process_parse_queue[collection].hasOwnProperty(item))) {
        return this.loading_process_parse_queue[collection][item];
      }
      return false;
    },

    /**
     * Remove each loaded script separately.
     */
    process_parse_queue_remove: function (collection, item) {
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
      // If options is a function, this is the "complete" callback.
      if (jQuery.isFunction(options)) {
        options = {
          complete: options
        };
      }

      // If extra is a function turn it to an object.
      if (jQuery.isFunction(extra)) {
        extra = {
          complete: extra
        };
      }

      return jQuery.extend(options, extra);
    },

    /**
     * Create url needed for scripts loading.
     */
    url: function (path, settings) {
      // By default, return url from wjs PHP collection manager path.
      /*f (settings === undefined || !(settings.hasOwnProperty('file')) || settings.file !== true) {
       path = this.settings.path_response + path;
       }*/
      // If file or absolute url specified.
      if (settings !== undefined && (settings.hasOwnProperty('absolute') && settings.absolute === true)) {
        path = window.location.origin + '/' + path;
      }
      // Return non absolute url for a file.
      return path + '?' + jQuery.param(settings.query);
    },

    /**
     * Remove object from array.
     */
    array_delete: function (array, item) {
      var index = array.indexOf(item);
      return this.array_delete_index(array, index);
    },

    /**
     * Remove element by index from array.
     */
    array_delete_index: function (array, index) {
      if (index !== -1) {
        array.splice(index, 1);
      }
      return array;
    },

    /**
     * Return length of object.
     */
    object_size: function (object) {
      var size = 0, key;
      for (key in object) {
        if (object.hasOwnProperty(key)) {
          size += 1;
        }
      }
      return size;
    },

    object_find: function (path, object) {
      var base = object, i;
      path = path.split('.');

      for (i in path) {
        if (path.hasOwnProperty(i) && base.hasOwnProperty(path[i])) {
          base = base[path[i]];
        }
      }

      return base;
    },

    replace_all: function (find, replace, string) {
      return string.replace(new RegExp(find, 'g'), replace);
    }
  };

  // Create w object.
  // Core is not initialised now but into page footer.
  window.w = new wjs();

}());
