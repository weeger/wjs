/**
 * wJs v2.6.9
 *
 * Copyright Romain WEEGER 2010 / 2014
 * http://www.wexample.com
 * 
 * Licensed under the MIT and GPL licenses :
 * 
 *  - http://www.opensource.org/licenses/mit-license.php
 *  - http://www.gnu.org/licenses/gpl.html
 */
(function (win) {
  'use strict';
  // <--]

  // Protect against multiple declaration.
  // Only one instance of this object is created per page.
  // Contain global javascript tools and helpers functions.
  if (win.wjs !== undefined) {
    return;
  }

  var wjs_class = function () {
    this.window = win;
    this.document = win.document;
    // Create default vars.
    this.extend(true, this, this.defaults);
  };

  wjs_class.prototype = {
    defaults: {
      client_only: true,
      version: '2.6.9',
      core_loaders: [],
      ready_functions: [],
      is_ready: false,
      processes: [],
      default_package: null,
      loaders: {},
      loader_add_default: {},
      loaded: {},
      loading_process_parse_queue: {},
      transcode: null,
      methods: {},
      transcoded_data: {},
      constructors: {},
      xhr: null
    },

    /**
     * Create basics elements to interact with the document.
     * Must be executed when document is ready.
     */
    init: function (options) {
      this.document_ready(function () {
        // Apply options.
        this.extend(true, this, options);
        this.xhr = new this.window.XMLHttpRequest();
        var loader_name;
        // Create loaders prototypes.
        for (loader_name in this.loader_add_default) {
          if (this.loader_add_default.hasOwnProperty(loader_name)) {
            this.loader_add(loader_name, this.loader_add_default[loader_name], true);
          }
        }
        // This var will not be used anymore.
        delete this.loader_add_default;
        // Load all other scripts then run ready functions.
        if (this.default_package !== null) {
          this.unpack(this.default_package, function () {
            // A transcode has been created for wjs, incorporate it.
            this.transcode = new (this.proto('wjs'))();
            // Execute startup functions.
            this.ready_complete();
          }.bind(this));
        }
      }.bind(this));
    },

    /**
     * Load specified collection of specified type / name.
     * @param {string} collection Type of collection.
     * @param {string} name Name of collection.
     * @param {function} complete Callback executed on loading complete.
     */
    load: function (collection, name, complete) {
      if (!this.collection(collection, name)) {
        this.loader(collection).load(name, complete);
      }
    },

    /**
     * Remove collection from memory.
     * @param {string} collection Type of collection.
     * @param {string} name Name of collection.
     * @param {function} complete Callback executed on loading complete.
     */
    unload: function (collection, name, complete) {
      if (this.collection(collection, name)) {
        this.loader(collection).unload(name, complete);
      }
    },

    /**
     * Because w must execute loading request on startup,
     * he needs his own ready function.
     * @param {function} callback Callback function executed on loading complete.
     */
    ready: function (callback) {
      if (this.is_ready === true) {
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
      // Mark as is_ready, further ready functions
      // will be executed directly.
      this.is_ready = true;
      for (i in this.ready_functions) {
        if (this.ready_functions.hasOwnProperty(i)) {
          this.ready_functions[i].call(this);
        }
      }
    },

    /**
     * Parse json data.
     * Used when data is not loaded by AJAX.
     * Basically as document startup.
     * @param {json} data
     * @param {function} complete Callback executed on loading complete.
     */
    unpack: function (data, complete) {
      this.load('json', data, complete);
    },

    /**
     * Return loader.
     * @param {string} name
     * @returns {*}
     */
    loader: function (name) {
      if (!this.loaders.hasOwnProperty(name)) {
        this.error('wjs : Try to get undefined loader "' + name + '"');
      }
      return this.loaders[name];
    },

    /**
     * Add new collection loader to wjs. It must be an
     * instance of wjs\\loader transcode.
     * @param {string} name
     * @param {object} methods
     * @param {boolean} init
     * @returns {*}
     */
    loader_add: function (name, methods, init) {
      // If wjs is not ready to add loaders, we have
      // a temporary variable for loaders, it is removed
      // into wjs init function.
      if (this.loader_add_default !== undefined && init !== true) {
        this.loader_add_default[name] = methods;
        return false;
      }
      if (!this.loaders.hasOwnProperty(name)) {
        var class_name = 'wjs\\loader\\' + name;
        // Allow to use short base name ex: javascript for wjs_loader_javascript.
        methods.base = methods.hasOwnProperty('base') ? 'wjs\\loader\\' + methods.base : 'wjs\\loader';
        // Add name to prototype.
        methods.name = name;
        this.extend_class(class_name, methods);
        this.loaders[name] = new (this.proto(class_name, class_name))(name);
        this.loaders[name].init();
      }
      return this.loaders[name];
    },

    /**
     * Set / Get data for specified collection.
     *
     * @param {string} type
     * @param {string} name
     * @param {object} data
     * @returns {*} Saved data for collection.
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
     * @param {object} data Returned data from server.
     * @param {function} process Instance of wjs\process.
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

    /**
     * Check if queue of specified process is empty.
     * Completed processes with a non empty parse queue
     * will return an error, due to unknown data returned from server.
     * @param {function} process Instance of wjs\process.
     * @returns {boolean}
     */
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

    /**
     * Return parse queue item content.
     * @param {string} collection Collection name for parse queue.
     * @param {string} item Item name.
     * @returns {*}
     */
    process_parse_queue_get: function (collection, item) {
      if ((this.loading_process_parse_queue.hasOwnProperty(collection)) && (this.loading_process_parse_queue[collection].hasOwnProperty(item))) {
        return this.loading_process_parse_queue[collection][item];
      }
      return false;
    },

    /**
     * Remove loaded script from parse queue.
     * @param {string} collection
     * @param item
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
     * Trigger custom event for dom element.
     * @param {string} name
     * @param {object} dom_element
     */
    event: function (name, dom_element) {
      var event;
      // Check browser support.
      if (this.window.document.createEvent) {
        event = this.window.document.createEvent("HTMLEvents");
        event.initEvent(name, true, true);
      }
      else {
        event = this.window.document.createEventObject();
        event.eventType = name;
      }

      event.eventName = name;

      if (this.window.document.createEvent) {
        dom_element.dispatchEvent(event);
      }
      else {
        dom_element.fireEvent("on" + event.eventType, event);
      }
    },

    /**
     * Convert user passed options to object. Useful when
     * function parameters could be : callback OR {complete:callback}
     * @param {object} options
     * @param {object} extra
     * @returns {*|{}}
     */
    extend_options: function (options, extra) {
      // If options is a function, this is the "complete" callback.
      if (typeof options === 'function') {
        options = {
          complete: options
        };
      }
      // If extra is a function turn it to an object.
      if (typeof extra === 'function') {
        extra = {
          complete: extra
        };
      }
      return this.extend(options, extra);
    },

    /**
     * Create url needed for scripts loading.
     * Used internally to build URL requests for
     * collections loading.
     *
     * @param {string} path
     * @param {object} settings
     * @returns {string}
     */
    url: function (path, settings) {
      // If file or absolute url specified.
      if (settings !== undefined && (settings.hasOwnProperty('absolute') && settings.absolute === true)) {
        path = this.window.location.origin + '/' + path;
      }
      // Return non absolute url for a file.
      return path + ((settings !== undefined && settings.hasOwnProperty('query')) ? '?' + this.param(settings.query) : '');
    },

    /**
     * Remove item from array.
     *
     * @param {Array} array
     * @param {*} item
     * @returns {*}
     */
    array_delete: function (array, item) {
      return this.array_delete_index(array, array.indexOf(item));
    },

    /**
     * Remove item having this index from array.
     *
     * @param {Array} array
     * @param {number} index
     * @returns {Array}
     */
    array_delete_index: function (array, index) {
      if (index !== -1) {
        array.splice(index, 1);
      }
      return array;
    },

    /**
     * Changes index of an item into an array.
     *
     * @param {Array} array
     * @param {number} index_from
     * @param {number} index_to
     * @returns {Array}
     */
    array_move: function (array, index_from, index_to) {
      array.splice(index_to, 0, array.splice(index_from, 1)[0]);
      return array;
    },

    /**
     * Simple AJAX request
     * @param {object} options Contain various ajax options.
     */
    ajax: function (options) {
      options.method = (options.hasOwnProperty('method')) ? options.method : 'GET';
      options.async = (options.hasOwnProperty('async')) ? options.async : false;
      this.xhr = new this.window.XMLHttpRequest();
      this.xhr.open(options.method, options.url, options.async);
      this.xhr.onreadystatechange = function () {
        // Process complete.
        if (this.xhr.readyState === 4) {
          if (this.xhr.status === 200) {
            // Callback function specified.
            if (options.hasOwnProperty('success') && typeof options.success === 'function') {
              options.success(this.xhr);
            }
          }
          else {
            options.error(this.xhr);
          }
        }
      }.bind(this);
      if (options.method === 'POST') {
        this.xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      }
      this.xhr.send(this.param(options.data));
    },

    /**
     * Transform object to URL query string.
     * @param {object} object Query data in format {name:"value"}.
     * @returns {string}
     */
    param: function (object) {
      var i, query = [];
      for (i in object) {
        if (object.hasOwnProperty(i)) {
          query.push(i + '=' + object[i]);
        }
      }
      return query.join('&');
    },

    /**
     * Return length of object.
     * @param object
     * @returns {number}
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

    /**
     * Find data into an object using string path
     * like : "my.needle.name" into "haystack"
     * @param path
     * @param object object
     * @param {object} result Optional extra information about place who parameter was found.
     * @returns {*}
     */
    object_find: function (path, object, result) {
      var base = object, item, result_save = (result !== undefined && typeof result === 'object');
      path = path.split('.');
      while (path.length > 0) {
        item = path.shift();
        if (base.hasOwnProperty(item)) {
          // We are on the last item.
          if (path.length === 0) {
            if (result_save) {
              result.key = item;
              result.container = base;
            }
            return base[item];
          }
          base = base[item];
        }
      }
      return false;
    },

    /**
     * Remove variable of given object, using an object path.
     * @param {string} path
     * @param {object} object
     */
    object_cleanup: function (path, object) {
      if (this.object_size(this.object_find(path, object)) === 0) {
        // Use indirect eval for code inspectors.
        var eval_callback = eval;
        // We need to pass reference to this into eval.
        this.window.object_cleanup_temp = object;
        // Use eval to access variable to delete.
        eval_callback('delete this.window.object_cleanup_temp.' + path + ';');
        // Delete reference.
        delete this.window.object_cleanup_temp;
      }
    },

    /**
     * Replace all occurrences of a string.
     *
     * @param {string} find Needle
     * @param {string} replace Replacement
     * @param {string} string Haystack
     * @returns {string}
     */
    replace_all: function (find, replace, string) {
      return string.replace(new RegExp(find, 'g'), replace);
    },

    /**
     * This is a quasi clone of jQuery's extend() function.
     * @returns {*|{}}
     */
    extend: function () {
      // Make a copy of arguments to avoid JS inspector hints.
      var to_add, name, copy_is_array, clone,
      // The target object who receive parameters
      // form other objects.
        target = arguments[0] || {},
      // Index of first argument to mix to target.
        i = 1,
      // Mix target with all function arguments.
        length = arguments.length,
      // Define if we merge object recursively.
        deep = false;

      // Handle a deep copy situation.
      if (typeof target === 'boolean') {
        deep = target;
        // Skip the boolean and the target.
        target = arguments[ i ] || {};
        // Use next object as first added.
        i += 1;
      }

      // Handle case when target is a string or something (possible in deep copy)
      if (typeof target !== 'object' && typeof target !== 'function') {
        target = {};
      }

      // Loop trough arguments.
      for (false; i < length; i += 1) {
        // Only deal with non-null/undefined values
        if ((to_add = arguments[ i ]) !== null) {
          // Extend the base object.
          for (name in to_add) {
            // We do not wrap for loop into hasOwnProperty,
            // to access to all values of object.
            // Prevent never-ending loop.
            if (target === to_add[name]) {
              continue;
            }
            // Recurse if we're merging plain objects or arrays.
            if (deep && to_add[name] && (this.is_plain_object(to_add[name]) || (copy_is_array = Array.isArray(to_add[name])))) {
              if (copy_is_array) {
                copy_is_array = false;
                clone = target[name] && Array.isArray(target[name]) ? target[name] : [];
              }
              else {
                clone = target[name] && this.is_plain_object(target[name]) ? target[name] : {};
              }
              // Never move original objects, clone them.
              target[name] = this.extend(deep, clone, to_add[name]);
            }
            // Don't bring in undefined values.
            else if (to_add[name] !== undefined) {
              target[name] = to_add[name];
            }
          }
        }
      }
      return target;
    },

    /**
     * Check to see if an object is a plain object
     * (created using "{}" or "new Object").
     * Forked from jQuery.
     * @param obj
     * @returns {boolean}
     */
    is_plain_object: function (obj) {
      // Not plain objects:
      // - Any object or value whose internal [[Class]] property is not "[object Object]"
      // - DOM nodes
      // - win dow
      if (obj === null || typeof obj !== "object" || obj.nodeType || (obj !== null && obj === obj.window)) {
        return false;
      }
      // Support: Firefox <20
      // The try/catch suppresses exceptions thrown when attempting to access
      // the "constructor" property of certain host objects, ie. |win dow.location

      // https://bugzilla.mozilla.org/show_bug.cgi?id=814622
      try {
        if (obj.constructor && !this.hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf")) {
          return false;
        }
      } catch (e) {
        return false;
      }
      // If the function hasn't returned already, we're confident that
      // |obj| is a plain object, created by {} or constructed with new Object
      return true;
    },

    /**
     * Returns true if it is a DOM node.
     * Found at {@link http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object}
     * @param {*} object
     * @returns {boolean}
     */
    is_dom_node: function (object) {
      return (
        typeof this.window.Node === "object" ? object instanceof this.window.Node :
          object && typeof object === "object" && typeof object.nodeType === "number" && typeof object.nodeName === "string"
        );
    },

    /**
     * Returns true if it is a DOM element.
     * Found at {@link http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object}
     * @param {*} object
     * @returns {boolean}
     */
    is_dom_element: function (object) {
      return (
        typeof this.window.HTMLElement === "object" ? object instanceof this.window.HTMLElement : // DOM2
          object && typeof object === "object" && object !== null && object.nodeType === 1 && typeof object.nodeName === "string"
        );
    },

    /**
     * Call super method of the given object and method, searching for
     * multiple inheritance levels. This function creates a temporary
     * variable called "_call_base_bases", to inspect whole inheritance linage.
     * It will be deleted at the end of inspection.
     *
     * Usage : Inside your method use call_base(this, 'method_name', arguments);
     *
     * @param {object} object The owner object of the method and inheritance linage
     * @param {string} method The name of the super method to find.
     * @param {object} args The calls arguments, basically use the "arguments" special variable.
     * @returns {*} The data returned from the super method.
     */
    call_base: function (object, method, args) {
      // We create an object to keep reference to "base" object,
      // it will be replaced during linage exploration to always keep
      // direct parent object. We use a object to save multiple references
      // if various call_base are launched for different methods.
      if (!object.hasOwnProperty('_call_base_bases')) {
        object._call_base_bases = {};
        object._call_base_pass = {};
      }
      // Create shortcuts.
      var passes = object._call_base_pass,
        bases = object._call_base_bases,
      // Get pass level in case of recursive calls.
        pass_index = passes[method] !== undefined ? passes[method] : 0,
      // We get base object, first time it will be passed object,
      // but in case of multiple inheritance, it will be instance of parents objects.
        base = bases.hasOwnProperty(method) && bases[method].hasOwnProperty(pass_index) ? bases[method][pass_index][bases[method][pass_index].length - 1] : object,
      // We get matching method, from current object,
      // this is a reference to define super method.
        object_current_method = base[method],
      // Temp object wo receive method definition.
        descriptor = null,
      // We define super function after founding current position.
        is_super = false,
      // Contain output data.
        output = null,
        done = false;
      // Iterates over the base prototypes chain.
      while (base !== null && done !== true) {
        // Get method info
        descriptor = Object.getOwnPropertyDescriptor(base, method);
        if (descriptor !== undefined) {
          // We search for current object method to define inherited part of chain.
          if (descriptor.value === object_current_method) {
            // Further loops will be considered as inherited function.
            is_super = true;
          }
          // We already have found current object method.
          else if (is_super === true) {
            // We need to pass original object to apply() as first argument,
            // this allow to keep original instance definition along all method
            // inheritance. But we also need to save reference to "base" who to
            // contain parent class, it will be used into this function startup
            // begin at the right chain position. First we create method entry.
            if (bases[method] === undefined) {
              passes[method] = 0;
              bases[method] = [];
            }
            // Then we create pass entry.
            if (bases[method][pass_index] === undefined) {
              bases[method][pass_index] = [];
            }
            // We store base object.
            bases[method][pass_index].push(base);
            // We replace own method by a launcher who manage internal iteration.
            object[method] = this._call_base_callback(object, method, passes, object_current_method);
            // Apply super method.
            output = descriptor.value.apply(object, args);
            // Return to original function.
            object[method] = object_current_method;
            // Property have been used into super function if another
            // call_base() is launched. Reference is not useful anymore.
            bases[method][pass_index].pop();
            // Cleanup array.
            if (bases[method][pass_index].length === 0) {
              this.array_delete_index(bases[method], pass_index);
            }
            // Delete empty array.
            if (bases[method].length === 0) {
              delete bases[method];
              delete passes[method];
            }
            // Job is done.
            done = true;
          }
        }
        // Iterate to the next parent inherited.
        base = Object.getPrototypeOf(base);
      }
      // Cleanup temp variable.
      if (this.object_size(bases) === 0) {
        delete object._call_base_bases;
        delete object._call_base_pass;
      }
      // Return retrieved content.
      if (done) {
        return output;
      }
    },

    _call_base_callback: function (object, method, passes, object_current_method) {
      return function () {
        // We rise pass level.
        passes[method] += 1;
        // We execute function.
        var output = object_current_method.apply(object, arguments);
        // We lower pass level.
        passes[method] -= 1;
        // The return output content.
        return output;
      };
    },

    /**
     * Merge variable from base to this instance type.
     * Non deep merge.
     * @param object
     * @param variable
     * @returns {{}}
     */
    inherit_object: function (object, variable) {
      var output = {},
      // Get list of variable in different states levels.
        variables = this.inherit_get_property(object, variable),
        i;
      // Merge variables.
      for (i in variables) {
        if (variables.hasOwnProperty(i)) {
          this.extend(output, variables[i]);
        }
      }
      return output;
    },

    /**
     * Get linage of a specified property from an inherited object.
     * @param object
     * @param property
     * @returns {Array}
     */
    inherit_get_property: function (object, property) {
      var base = Object.getPrototypeOf(object),
        output = [];
      // Use hasOwnProperty to define if we are out of
      // inherited objects.
      while (base !== null) {
        // Take only variable present in current prototype.
        if (base.hasOwnProperty(property)) {
          output.push(base[property]);
        }
        base = Object.getPrototypeOf(base);
      }
      return output.reverse();
    },

    /**
     * Copy data from add to result, and
     * add make inheritance for functions.
     * Other properties types are non deep extended.
     * @param {object} result Object to extend.
     * @param {object} add Object to add to result.
     */
    inherit_prototype: function (result, add) {
      var i, is_array;
      for (i in add) {
        if (add.hasOwnProperty(i)) {
          // Functions has a special case.
          if (typeof add[i] === 'function') {
            result[i] = this.inherit_function(result, result[i], add[i]);
          }
          else if (this.is_plain_object(add[i]) || (is_array = Array.isArray(add[i]))) {
            // Make a clone of object or array.
            result[i] = is_array ? [] : {};
            // Create a non-deep copy.
            this.extend(result[i], add[i]);
          }
          // Other variables are copied.
          else {
            result[i] = add[i];
          }
        }
      }
    },

    /**
     * Create all super method for specified object's method,
     * based on prototype creation linage.
     * @param {object} object Instance of object containing method.
     * @param {string} method Method name as Object.methodName.
     */
    inherit_method: function (object, method) {
      var i, linage = this.inherit_get_property(object, method);
      // Get first version as base.
      object[method] = linage.shift();
      while (i = linage.shift()) {
        // Adds all previous version as a base method (super method).
        object[method] = this.inherit_function(object, object[method], i);
      }
    },

    /**
     * Create a super method for first function, pointing to
     * the second function with a __base() call.
     * @param object
     * @param base
     * @param add
     * @returns {}
     */
    inherit_function: function (object, base, add) {
      // Base method is called with __base() function.
      return this._inherit_function.apply(object, [add, base]);
    },

    _inherit_function: function (method, base_method) {
      return function () {
        if (this === undefined) {
          this.error('Call inherit function from undefined object : ' + method);
        }
        var baseSaved = this.__base,
          result;
        this.__base = (typeof base_method === 'function') ? base_method : function () {
        };
        result = method.apply(this, arguments);
        this.__base = baseSaved;
        return result;
      }.bind(this);
    },

    /**
     * Merge variable from base to current instance type.
     * Create inheritance for functions.
     *
     * @param {object} object
     * @param {string} name
     */
    inherit_linage: function (object, name) {
      var variables = this.inherit_get_property(object, name),
        i;
      // Reset package.
      object[name] = {};
      // Merge inherited packages.
      for (i in variables) {
        if (variables.hasOwnProperty(i)) {
          // Create base constructor for functions.
          this._inherit_linage(object, object[name], variables[i]);
        }
      }
    },

    /**
     * Inspect package tree to merge content.
     * @param {object} object
     * @param {object} result
     * @param {object} add
     * @private
     */
    _inherit_linage: function (object, result, add) {
      var i;
      for (i in add) {
        if (add.hasOwnProperty(i)) {
          if (typeof add[i] === 'function') {
            // We don't use inherit_method, we already got list of
            // inherited property into the main inherit_linage method.
            result[i] = this.inherit_function(object, result[i], add[i]);
          }
          // Escape some objects to avoid recursions.
          else if (this.is_plain_object(add[i])) {
            if (!result.hasOwnProperty(i)) {
              result[i] = {};
            }
            // Continue to search for other functions.
            this._inherit_linage(object, result[i], add[i]);
          }
          else if (Array.isArray(add[i])) {
            result[i] = [];
            this.extend(result[i], add[i]);
          }
          else {
            result[i] = add[i];
          }
        }
      }
    },

    /**
     * Add definitions to an existing constructor.
     * @param {string} name
     * @param {object} methods
     */
    extend_class: function (name, methods, lineage) {
      if (this.methods.hasOwnProperty(name)) {
        this.extend(this.methods[name], methods);
      }
      else {
        this.methods[name] = methods;
        if (lineage === true) {
          // Create linage.
          this.methods[name].lineage = '';
          if (this.methods[name].base) {
            if (this.methods[this.methods[name].base] !== undefined && this.methods[this.methods[name].base].hasOwnProperty('lineage') && this.methods[this.methods[name].base].lineage !== '') {
              this.methods[name].lineage = this.methods[this.methods[name].base].lineage + '-';
            }
            this.methods[name].lineage += this.methods[name].base;
          }
        }
      }
    },

    /**
     * Return a new instance of required transcode item.
     * @param {string} name Transcode class name.
     * @returns {object} Transcode prototype ready to be instantiated with "new".
     */
    proto: function (name) {
      // Base object is created once.
      if (!this.constructors.hasOwnProperty(name)) {
        // It may have base constructor send from transcoded data.
        var parent = 'wjs\\transcode',
          base;
        // Maybe a parent is specified into transcoded data.
        parent = this.transcoded_data.hasOwnProperty(name) ? this.transcoded_data[name].__PARENT__ : parent;
        if (parent === name) {
          this.error('Unable to find base constructor for ' + name + ' : ' + parent);
        }
        // Or is specified into prototype.
        parent = this.methods.hasOwnProperty(name) && this.methods[name].hasOwnProperty('base') ? this.methods[name].base : parent;
        base = this.proto(parent);
        // Create base object.
        this.constructors[name] = function () {
          return this.__construct.apply(this, arguments);
        };
        // Append base constructor.
        this.constructors[name].prototype = Object.create(base.prototype);
        // Adjust constructor to make instanceof works.
        this.constructors[name].prototype.constructor = base;
        this.constructors[name].prototype.transcode_class_name = name;
        this.constructors[name].prototype.w = this;
      }
      // Add extra method at each pass, in case of
      // prototype have been extended after first
      // constructor creation.
      if (this.methods.hasOwnProperty(name)) {
        this.extend(this.constructors[name].prototype, this.methods[name]);
      }
      return this.constructors[name];
    },

    proto_remove: function (name) {
      if (this.constructors.hasOwnProperty(name)) {
        delete this.constructors[name];
      }
    },

    /**
     * Thrown wjs specific error.
     * @param {string} message
     */
    error: function (message) {
      throw new Error('[wjs error] : ' + message);
    },

    /**
     * Append function to execute when document is ready.
     * Only one function is supported. This function is used
     * internally for init function. To add callbacks to wjs,
     * use w.ready() function instead.
     * @param {function} fn Anonymous function callback.
     */
    document_ready: function (fn) {
      var done = false, top = true,
        doc = this.window.document, root = doc.documentElement,
        add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
        rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
        pre = doc.addEventListener ? '' : 'on',

        init = function (e) {
          if (e.type === 'readystatechange' && doc.readyState !== 'complete') {
            return;
          }
          (e.type === 'load' ? this.window : doc)[rem](pre + e.type, init, false);
          if (!done && (done = true) !== false) {
            fn.call(this.window, e.type || e);
          }
        },

        poll = function () {
          try {
            root.doScroll('left');
          } catch (e) {
            this.window.setTimeout(poll, 50);
            return;
          }
          init('poll');
        };

      if (doc.readyState === 'complete') {
        fn.call(this.window, 'lazy');
      }
      else {
        if (doc.createEventObject && root.doScroll) {
          try {
            top = !this.window.frameElement;
          }
          catch (e) {
          }
          if (top) {
            poll();
          }
        }
        doc[add](pre + 'DOMContentLoaded', init, false);
        doc[add](pre + 'readystatechange', init, false);
        this.window[add](pre + 'load', init, false);
      }
    }
  };
  // Create global instance.
  win.wjs =
    // TODO Remove
    win.w = new wjs_class();

  /**
   * Class transcode are used as base
   * constructor to allow object to be
   * converted into other languages,
   * basically from PHP to Javascript.
   * It also manage several paths to define
   * client / server roots and other custom
   * locations. This way, it maintain stability
   * of the same program between different environments.
   */
  wjs.constructors['wjs\\transcode'] = function () {

  };

  wjs.constructors['wjs\\transcode'].prototype = {
    // List of required paths by constructor.
    paths_required: [],
    transcode_class_name: undefined,
    // Store data able to be converted in this variable.
    transcoded_data: {
      server: {
        paths: {
          root: ''
        }
      },
      client: {
        paths: {
          root: ''
        }
      }
    },
    w: null,

    /**
     * Construct object with predefined paths,
     * paths_required allow to specify which path
     * is expected on construction.
     * @param {object} paths
     */
    __construct: function (transcode_id, paths) {
      // If no transcode id, maybe we have only one instance
      // for this object, so we use name as an id.
      transcode_id = (transcode_id !== undefined) ? transcode_id : this.transcode_class_name;
      this.transcoded_data = this.w.extend(true, {}, this.transcoded_data);
      // Search for saved data.
      if (this.w.transcoded_data.hasOwnProperty(this.transcode_class_name) && this.w.transcoded_data[this.transcode_class_name].hasOwnProperty(transcode_id)) {
        // Add transcoded data.
        this.w.extend(true, this.transcoded_data, this.w.transcoded_data[this.transcode_class_name][transcode_id]);
      }
      // Add paths.
      if (paths !== undefined) {
        var side, i;
        // Search for unfilled paths.
        for (side in this.paths_required) {
          if (this.paths_required.hasOwnProperty(side)) {
            if (paths.hasOwnProperty(side)) {
              this.w.error('Missing paths side : ' + side);
            }
            else {
              for (i in this.paths_required[side]) {
                if (this.paths_required[side].hasOwnProperty(i) && !paths.hasOwnProperty(i)) {
                  this.w.error('Missing constructor paths arguments : ' + side + ' > ' + i);
                }
              }
            }
          }
        }
        // Use common method to save multiple paths.
        this.paths(paths);
      }
    },

    /**
     * Set / Get a variable into the exportable
     * data for other languages.
     * @param {string} side
     * @param {string} name
     * @param {*=} [value]
     * @return mixed
     */
    transcoded_variable: function (side, name, value) {
      if (value !== undefined) {
        this.transcoded_data[side][name] = value;
      }
      // We not support to access to undefined side.
      if (!this.transcoded_data.hasOwnProperty(side)) {
        this.w.error('Trying to access to undefined transcoded data side : ' + side);
        return false;
      }
      return this.transcoded_data[side].hasOwnProperty(name) ? this.transcoded_data[side][name] : false;
    },

    /**
     * Return value of a path without
     * prepend value of root path.
     * @param {string} side
     * @param {string} name
     * @returns string
     */
    path_raw: function (side, name) {
      var paths = this.transcoded_variable(side, 'paths');
      return paths.hasOwnProperty(name) ? paths[name] : false;
    },

    /**
     * Set value of a path.
     * Return value of a path with root path prepended.
     * @param {string} side
     * @param {string} name
     * @param {string=} [value]
     * @returns {*}
     */
    path: function (side, name, value) {
      // Save as a transcoded variable.
      var paths = this.transcoded_variable(side, 'paths'),
        path_raw;
      if (value !== undefined) {
        paths[name] = value;
        this.transcoded_variable(side, 'paths', paths);
      }
      // Return requested path if exists.
      path_raw = this.path_raw(side, name);
      if (path_raw !== false) {
        // Append root path.
        return (name !== 'root' ? paths.root : '') + this.path_raw(side, name);
      }
      return false;
    },

    /**
     * Save multiple paths in one time.
     * @param {string|object} side
     * @param {object=} [paths]
     * @returns {*}
     */
    paths: function (side, paths) {
      var name, output = [], paths_saved;
      if (side instanceof Array) {
        for (name in paths) {
          if (paths.hasOwnProperty(name)) {
            this.paths(name, paths);
          }
        }
        return null;
      }
      // Set paths.
      if (paths !== undefined) {
        for (name in paths) {
          if (paths.hasOwnProperty(name)) {
            this.path(side, name, paths[name]);
          }
        }
      }
      // Get paths.
      else {
        paths_saved = this.transcoded_variable(side, 'paths');
        for (name in paths_saved) {
          if (paths_saved.hasOwnProperty(name) && paths.hasOwnProperty(name)) {
            output[name] = this.path(side, name);
          }
        }
        return output;
      }
    },

    /**
     * Convert exportable data into expected format.
     * Use internal named function for specific conversions.
     * @returns {*}
     */
    convert: function () {
      var format = arguments.shift(),
        method = 'convert_to_' + format;
      if (this.hasOwnProperty(method)) {
        return this[method].apply(this, arguments);
      }
      // Errors are not allowed.
      this.w.error('Trying to export unsupported format ' + format);
    },

    /**
     * Return data as an array.
     * This may be used to convert data by
     * others scripts.
     * @returns {*}
     */
    convert_to_array: function () {
      return this.transcoded_data;
    }
  };

  wjs.extend_class('wjs\\loader', {
    type: 'undefined',
    w: null,

    __construct: function (type) {
      this.w.call_base(this, '__construct', arguments);
      this.type = type;
      // Add an entry into wjs to save loaded scripts.
      if (!this.w.loaded.hasOwnProperty(this.type)) {
        this.w.loaded[this.type] = {};
      }
      this.w.loaders[this.type] = this;
    },

    init: function (options) {
      // To override...
      // Called after instance create and extension.
    },

    /**
     * By default, load just execute complete callback,
     * it should be override by subclasses.
     */
    load: function (name, complete) {
      // Adjust options and complete callback.
      var options = this.w.extend_options(complete);
      // Execute complete.
      if (options.hasOwnProperty('complete')) {
        options.complete();
      }
    },

    unload: function (name, complete) {
      // Adjust options and complete callback.
      var options = this.w.extend_options(complete);
      // Delete internal reference.
      delete this.w.loaded[this.type][name];
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
      return new this.w.process(this.w.extend_options(options), this.w);
    },

    load_ajax: function (name, options) {
      var item;
      // Adjust options and complete callback.
      options = this.w.extend_options(options);
      // Search into not parsed content in result is already loaded.
      item = this.w.process_parse_queue_get(this.type, name);
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
      this.load('javascript_link', url);
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
        this.get_script(data.replace('cache://', this.w.path('client', 'cache')));
        return;
      }
      // Load required elements first.
      if (data.hasOwnProperty('#require')) {
        for (i in data['#require']) {
          if (data['#require'].hasOwnProperty(i)) {
            for (j in data['#require'][i]) {
              if (data['#require'][i].hasOwnProperty(j)) {
                this.w.load(i, data['#require'][i][j]);
              }
            }
          }
        }
      }
      // Parse content with specific functions.
      for (i in data) {
        if (data.hasOwnProperty(i) && typeof this['parse_' + i] === 'function') {
          this['parse_' + i](name, data[i]);
        }
      }
      // This function may be extended.
      // In all case it should remove data from parse queue.
      this.w.process_parse_queue_remove(this.type, name);
    }
  });

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

  wjs.loader_add('css_link', {
    /**
     * Javascript are loaded via AJAX.
     */
    load: function (url) {
      var script = this.w.document.createElement('link');
      script.setAttribute('type', 'text/css');
      script.setAttribute('rel', 'stylesheet');
      script.setAttribute('media', 'all');
      script.setAttribute('href', url);
      this.w.document.head.appendChild(script);
      this.w.collection(this.type, url, true);
    }
  });

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

  wjs.loader_add('javascript_link', {
    /**
     * Javascript are loaded via AJAX.
     */
    load: function (urls, complete) {
      urls = (typeof urls === 'string') ? [urls] : urls;
      this.queue = urls;
      this.queue_complete = complete;
      this.js_link_queue_check();
    },

    js_link_queue_next: function () {
      var url = this.queue.shift(),
        script = this.w.document.createElement('script');

      script.onreadystatechange = function () {
        if (this.readyState === 'complete') {
          this.js_link_queue_check();
        }
      }.bind(this);
      script.onload = this.js_link_queue_check.bind(this);
      script.setAttribute('type', 'text/javascript');
      script.setAttribute('src', url);
      this.w.document.head.appendChild(script);
      this.w.collection(this.type, url, true);
    },

    js_link_queue_check: function () {
      if (this.queue.length > 0) {
        this.js_link_queue_next();
      }
      else if (typeof this.queue_complete === 'function') {
        this.queue_complete();
      }
    }
  });

  wjs.loader_add('json', {

    load: function (name, options) {
      // We can use load_json with no name. In this case
      // options is never undefined due to extend_options,
      // but it can be empty.
      if (typeof name === 'object') {
        // Adjust options and complete callback.
        options = this.w.extend_options(options);
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
        if (script.hasOwnProperty('data')) {
          process.parse(script.data);
        }
        // Stop process.
        process.loading_queue_complete(loading_queue_id, [script.data]);
      }
      else {
        process.script_ajax(this.type, script.name);
      }
    },

    parse_json: function (name, value) {
      this.w.collection(this.type, name, value);
    }
  });
  // [-->
}(window));