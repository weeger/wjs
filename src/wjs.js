// wJs v3.3.4 - (c) Romain WEEGER 2010 / 2014 - www.wexample.com | MIT and GPL licenses
(function (context) {
  'use strict';
  // <--]
  var wjsVersion = '3.3.4', WJSProto;
  // Protect against multiple declaration.
  // Only one instance of this object is created per page.
  // Contain global javascript tools and helpers functions.
  if (context.wjs !== undefined && context.wjs.version === wjsVersion) {
    return;
  }

  /** @constructor */
  WJSProto = function () {
    var self = this;
    self.extendObject(self, {
      context: context,
      window: context.window || window,
      document: context.document || window.document,
      /** @type {string} */
      version: wjsVersion,
      /** @type Array.Function */
      readyCallbacks: [],
      /** @type {boolean} */
      readyComplete: false,
      /** @type {Object} */
      packageDefault: null,
      /** @type {Object.Object} */
      loaders: {},
      /** @type {Array.string} */
      loadersExtra: [],
      /** @type {Array.string} */
      loadersBasic: [],
      /** @type {Object.Object.?} */
      extLoaded: {WjsLoader: {}},
      /** @type {Object.Array.string} */
      extRequire: {},
      /** @type {WJSProcessProto} Reference to prototype */
      processProto: null,
      /** @type {Array.WJSProcessProto} */
      processes: [],
      /** @type {Object.Function} */
      classProtos: {},
      /** @type {Object.Object} */
      classMethods: {},
      /** @type {Object.Object} */
      destroyQ: [],
      /** @type {Object.Object} */
      cacheBuffer: {},
      /** @type {Object} */
      settings: null,
      /** @type {RegExp} */
      linkReg: new RegExp('^wjs://([a-zA-Z0-9]*):([a-zA-Z0-9]*)$')
    });
    // Add a global wjsContext, use
    // by scripts links to access to wjs.
    self.context.wjsContext = context;
  };

  WJSProto.prototype = {

    /**
     * Create basics elements to interact with the document.
     * Must be executed when document is ready.
     */
    init: function (options) {
      var self = this;
      this.window.addEventListener('load', function () {
        // Apply options.
        self.extendObject(self, options);
        // Create basic loaders who are required by package.
        for (var i = 0; i < self.loadersBasic.length; i++) {
          self.loaderAdd(self.loadersBasic[i], undefined, true);
        }
        // Append document parse function at ready end.
        self.ready(function () {
          self.linksInit(self.document.body);
        });
        // Load all other scripts then run ready functions.
        // Execute startup functions.
        // Create a loading process to parse package content.
        new self.processProto({
          complete: function () {
            delete self.packageDefault;
            // Mark as readyComplete, further ready functions
            // will be executed directly.
            self.readyComplete = true;
            self.callbacks(self.readyCallbacks);
          }
          // Directly treat object as response.
        }).responseParse(self.packageDefault);
      });
    },

    /**
     * Because w must execute loading request on startup,
     * he needs his own ready function.
     * @param {function(...)} callback Function executed on loading complete.
     */
    ready: function (callback) {
      if (this.readyComplete === true) {
        // Execute callback asynchronously.
        // IE need function wrap.
        this.window.setTimeout(function () {
          callback();
        });
      }
      else {
        this.readyCallbacks.push(callback);
      }
    },

    /**
     * Execute an array of callbacks functions.
     * @param {Array} callbacksArray
     * @param {Array} args
     */
    callbacks: function (callbacksArray, args) {
      for (var i = 0; i < callbacksArray.length; i++) {
        callbacksArray[i].apply(this, args);
      }
    },

    /**
     * Search for links like wjs://extensionType:extensionName
     * @param {Object} domElement
     */
    linksInit: function (domElement) {
      // Search for html containing href="wjs://..."
      var wjsLinks = domElement.querySelectorAll('a[href^="wjs://"]'),
        i = 0, href, disable = function () {
          return false;
        };
      for (; i < wjsLinks.length; i++) {
        href = wjsLinks[i].getAttribute('href');
        wjsLinks[i].setAttribute('href', '#');
        // Firefox need to disable onclick for some links.
        wjsLinks[i].onclick = disable;
        wjsLinks[i].setAttribute('data-wjs-link', href);
        wjsLinks[i].addEventListener('click', this.linksClick.bind(this));
      }
    },

    /**
     * Callback on click on wjs links.
     * @param {Event} e
     */
    linksClick: function (e) {
      var self = this,
        link = e.target.getAttribute('data-wjs-link').match(self.linkReg);
      self.loadersExists(link[1], function () {
        self.loaders[link[1]].link(link[2]);
      });
      return false;
    },

    /**
     * Add new collection loader to wjs.
     * It must be an instance of WjsLoader.
     * @param {string} name
     * @param {Object} methods
     * @param {boolean=} register True says to save as loaded extension.
     */
    loaderAdd: function (name, methods, register) {
      var self = this;
      // We can define loader with no specific method.
      methods = methods || {};
      if (!self.loaders[name]) {
        var className = 'WjsLoader' + name;
        // Add name to prototype.
        methods.type = name;
        // Allow to use custom base class.
        methods.classExtends = methods.classExtends || 'WjsLoader';
        self.classExtend(className, methods);
        self.loaders[name] = new (self.classProto(className))(name);
        self.extRequire[name] = {};
        // We have to deal between WjsLoader, instance of and jsLink,
        // wjs.extLoaded.WjsLoader must exists to save jsLink loader,
        // but jsLink loader is base constructor of WjsLoader, so it
        // have to be created before jsLink. wjs.extLoaded.WjsLoader
        // is present before WjsLoader creation.
        self.extLoaded[name] = self.extLoaded[name] || {};
        if (register) {
          // If register is set to true, we save loader as extension,
          // It is useful when loader is not created with WjsLoader,
          // like WjsLoader itself and basics ones.
          self.extLoaded.WjsLoader[name] = methods;
        }
      }
    },

    /**
     * Returns a boolean if a loader exists.
     * If not, it try to download it.
     * @param {Array} types
     * @param {Function} complete
     * @return {*}
     */
    loadersExists: function (types, complete) {
      types = Array.isArray(types) ? types : [types];
      var self = this, i, use = [];
      // Search for existing loaders.
      for (i = 0; i < types.length; i++) {
        if (!self.loaders[types[i]]) {
          if (self.loadersExtra.indexOf(types[i])) {
            use.push(types[i]);
          }
          else {
            // One loader do not exists at all.
            return false;
          }
        }
      }
      return (use.length > 0) ? this.use({WjsLoader: use}, complete) : complete();
    },

    /**
     * Load specified collection of specified type / name.
     * During the whole process we try to return loaded data if
     * no async method is launched.
     * @param {string} type
     * @param {string} name
     * @param {Object|Function=} options
     * @return {?}
     */
    use: function (request, options) {
      var self = this;
      // Treat if request is just two strings.
      if (typeof request === 'string') {
        // Transform request to a multi request.
        var multiple = {};
        // User request as type, options as name.
        multiple[request] = [options];
        options = self.extendOptions(arguments[2], {
          mainType: request,
          mainName: options
        });
        // And maybe option exists as a third argument.
        return self.use(multiple, options);
      }
      // Make first a specific verification for loaders,
      // Use them if needed, loaders can't have
      return self.loadersExists(Object.keys(request), function () {
        // Loader exists, we can search for asked extension.
        // Transform callback to object, if not already one.
        options = self.extendOptions(options);
        var i, j, k, destroyQIndex, type, name, use, processQueued, types = Object.keys(request),
          process = new (self.processProto)(options),
          extensionData;
        // Iterates over requested types.
        for (i = 0; i < types.length; i++) {
          type = types[i];
          // Contain list of really missing extensions to retrieve.
          use = [];
          // Iterates over items
          for (j = 0; j < request[type].length; j++) {
            name = request[type][j];
            for (destroyQIndex = 0; destroyQIndex < self.destroyQ.length; destroyQIndex++) {
              if (self.destroyQ[destroyQIndex]['#items'][type] && self.destroyQ[destroyQIndex]['#items'][type][name]) {
                self.destroyQ[destroyQIndex]['#callbacks'].push(function () {
                  // Launch request again.
                  return self.use(request, options);
                });
                return;
              }
            }
            // Destroy item if reload asked.
            if (options.reload === true || self.loaders[type].preventReload === false) {
              // Destroy also dependencies.
              self.destroy(type, name, true);
            }
            extensionData = self.get(type, name);
            // Check if data is missing.
            if (!extensionData) {
              // Search if a process is not currently
              // waiting to be parsed, and containing requested data,
              // in this case, current process will be delayed again.
              for (k = 0; k < self.processes.length; k++) {
                processQueued = self.processes[k];
                if (processQueued.parseQ[type] &&
                  processQueued.parseQ[type][name]) {
                  // We have found a non terminated process, we shut down this one.
                  process.loadingComplete(true);
                  // A process is about to parse requested extension,
                  // We enforce process to parse it now.
                  return processQueued.responseParseItem(type, name, function () {
                    // Launch request again.
                    return self.use(request, options);
                  });
                }
              }
              // Item not found, we need to retrieve it.
              use.push(name);
            }
          }
          // We hook loaders to add request(s).
          self.loaders[type].extRequestInit(use, process, options);
        }
        // We start process.
        process.loadingStart();
        if (options.mainType) {
          // Return data if exists,
          // If only async process and parsing as been asked
          // and retrieved, or if extension have been already loaded,
          // there is a chance that content can be return, otherwise
          // user should have conscience of type of content he manipulates.
          return self.get(options.mainType, options.mainName);
        }
      });
    },

    /**
     * Return data saved for one extension.
     * @param {string} type
     * @param {string} name
     * @return {?}
     */
    get: function (type, name) {
      var extList = this.extLoaded[type];
      // Return value if defined.
      // Use hasOwnProperty allow to save "undefined" for not found ext.
      return (extList && extList.hasOwnProperty(name)) ? extList[name] : false;
    },

    /**
     * Launch a destroying process.
     * A process pass trough loaders, and let them
     * manage the way to destroy extensions. It can
     * be asynchronous if loader ask for.
     * @param {string} type
     * @param {string} name
     * @param {boolean=} withDependencies
     */
    destroy: function (type, name, withDependencies) {
      var queue = {'#items': {}, '#callbacks': []};
      this.destroyQ.push(queue);
      // Add item to destroy queue.
      this.destroyEnqueue(queue, type, name, withDependencies);
      // Launch process.
      this.destroyNext(queue);
    },

    /**
     * Add extension to the destroy queue.
     * @param {Object} queue
     * @param {string} type
     * @param {string} name
     * @param {boolean} withDependencies
     */
    destroyEnqueue: function (queue, type, name, withDependencies) {
      var self = this;
      if (self.get(type, name) &&
        // Avoid to delete core and basics loaders.
        (type !== 'WjsLoader' ||
          (name !== 'WjsLoader' &&
            name !== 'JsLink' &&
            self.loadersBasic.indexOf(name) === -1))) {
        var requirementType, i, j, k , l, keys, keys2, keys3, shared,
          extRequire = self.extRequire,
          require = extRequire[type][name];
        // Create queue entry if not exists.
        queue['#items'][type] = queue['#items'][type] || {};
        // Add item to destroy queue.
        queue['#items'][type][name] = true;
        // Add requirements.
        if (require && withDependencies) {
          keys = Object.keys(require);
          for (i = 0; i < keys.length; i++) {
            for (j = 0; j < require[keys[i]].length; j++) {
              // Prevent to delete shared dependencies.
              if (!this.requireShared(type, name, keys[i], require[keys[i]][j])) {
                this.destroyEnqueue(queue, keys[i], require[keys[i]][j], withDependencies);
              }
            }
          }
        }
        // Remove requirements data.
        delete self.extRequire[type][name];
      }
    },

    /**
     * Return true if a extension is required by another one.
     * @param {string} type
     * @param {string} name
     * @param {string} requireType
     * @param {string} requireName
     * @return {boolean}
     */
    requireShared: function (type, name, requireType, requireName) {
      var keys2 = Object.keys(this.extRequire), keys3, k, l;
      // Search for shared dependencies.
      for (k = 0; k < keys2.length; k++) {
        keys3 = Object.keys(this.extRequire[keys2[k]]);
        for (l = 0; l < keys3.length; l++) {
          if (
          // Type is another one of enqueue arguments
            keys2[k] !== type && keys3[l] !== name &&
              // It contains the same dependency.
              this.extRequire[keys2[k]][keys3[l]][requireType] && this.extRequire[keys2[k]][keys3[l]][requireType].indexOf(requireName) !== -1) {
            return true;
          }
        }
      }
      return false;
    },

    /**
     * Launch destruction of the next item from destroy queue.
     * @param {Object} queue
     */
    destroyNext: function (queue) {
      var self = this,
        loaded = self.extLoaded,
        itemNext = this.queueNext(queue['#items']),
        type = itemNext.type,
        name = itemNext.name,
        output;
      if (itemNext) {
        // Hook loader.
        output = self.loaders[type].destroy(name, loaded[type][name], queue);
        // Pass to next item if allowed.
        if (output) {
          this.destroyNextComplete(queue);
        }
      }
      else {
        // Queue is complete.
        this.destroyQ.splice(this.destroyQ.indexOf(queue), 1);
        this.callbacks(queue['#callbacks']);
      }
    },

    /**
     * Called when the item is destroyed.
     * @param {Object} queue
     */
    destroyNextComplete: function (queue) {
      var self = this,
        loaded = self.extLoaded,
        itemNext = this.queueNext(queue['#items']);
      // Remove item from queue.
      this.queueRem(queue['#items'], itemNext.type, itemNext.name);
      // Remove entry.
      delete loaded[itemNext.type][itemNext.name];
      this.destroyNext(queue);
    },

    /**
     * Remove item from given queue.
     * @param {Object} queue
     * @param {string} type
     * @param {string} name
     */
    queueRem: function (queue, type, name) {
      delete queue[type][name];
      if (this.objectIsEmpty(queue[type])) {
        delete queue[type];
      }
    },

    /**
     * Get next item from queue.
     * @param {Object} queue
     * @return {*}
     */
    queueNext: function (queue) {
      var queueKey = Object.keys(queue)[0],
        queueItemsKey;
      // Take first existing item.
      if (queueKey) {
        // Content can be an array of names,
        // or an object with names as indexes.
        queueItemsKey = Object.keys(queue[queueKey])[0];
        if (queueItemsKey) {
          // Return the type / name pair.
          return {
            type: queueKey,
            name: queueItemsKey,
            data: queue[queueKey][queueItemsKey]
          };
        }
      }
      return false;
    },

    /**
     * Simple AJAX request
     * @param {Object} options Contain various ajax options.
     */
    ajax: function (options) {
      options.method = options.method || 'GET';
      options.async = options.async || false;
      var self = this,
        xhr = new self.window.XMLHttpRequest();
      xhr.open(options.method, options.url, options.async);
      xhr.onreadystatechange = function () {
        // Process complete.
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            // Callback function specified.
            if (options.success && typeof options.success === 'function') {
              options.success(xhr);
            }
          }
          else {
            options.error(xhr);
          }
        }
      };
      if (options.method === 'POST') {
        xhr.setRequestHeader('Content-type',
          'application/x-www-form-urlencoded');
      }
      xhr.send(options.data ? self.param(options.data) : undefined);
    },

    /**
     * Transform object to URL query string.
     * @param {Object} object Query data in format {name:"value"}.
     * @return {string}
     */
    param: function (object) {
      var i, query = [], keys = Object.keys(object);
      for (i = 0; i < keys.length; i++) {
        query.push(keys[i] + '=' + object[keys[i]]);
      }
      return query.join('&');
    },

    /**
     * Minimal extend function for objects,
     * add items from one object to another one,
     * merge can be assigned, to merge objects only.
     */
    extendObject: function (object, add, mergeObjects) {
      var i = 0, keys = Object.keys(add), key;
      for (; i < keys.length; i++) {
        key = keys[i];
        if (!mergeObjects || typeof add[key] !== 'object') {
          object[key] = add[key];
        }
        else {
          // Create an empty entry if not exists.
          object[key] = object[key] || {};
          this.extendObject(object[key], add[key]);
        }
      }
      return object;
    },

    /**
     * Convert user passed options to object. Useful to protect when
     * function parameters could be : callback OR {complete:callback}.
     * @param {Object} options
     * @param {Object=} extra
     * @return {Object}
     */
    extendOptions: function (options, extra) {
      // Always turn option into an object.
      if (!options) {
        options = {};
      }
      // If options is a function, this is the "complete" callback.
      else if (typeof options === 'function') {
        options = {
          complete: options
        };
      }
      // No extra option defined.
      if (!extra) {
        return options;
      }
      // Merge extra function to object.
      return this.extendObject(options, this.extendOptions(extra));
    },

    /**
     * Add function to a prototype, caring about
     * setters and getters definitions.
     * @param {Object} object
     * @param {Object} add
     * @return {*}
     */
    extendProto: function (object, add) {
      var i, keys = Object.keys(add);
      for (i = 0; i < keys.length; i++) {
        Object.defineProperty(object, keys[i],
          Object.getOwnPropertyDescriptor(add, keys[i]));
      }
      return object;
    },

    /**
     * Return if object is empty or not,
     * useful to not have to count whole object length.
     * @param {Object} object
     * @return {boolean}
     */
    objectIsEmpty: function (object) {
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          return false;
        }
      }
      return true;
    },

    /**
     * Add definitions to an existing constructor.
     * @param {string} name
     * @param {Object} methods
     */
    classExtend: function (name, methods) {
      var self = this;
      if (self.classMethods[name]) {
        self.extendProto(self.classMethods[name], methods);
      }
      else {
        self.classMethods[name] = methods;
      }
    },

    /**
     * Return a new instance of required item.
     * @param {string} name Class name.
     * @return {Object} Prototype ready to be instantiated with "new".
     */
    classProto: function (name) {
      var self = this;
      // Base object is created once.
      if (!self.classProtos[name]) {
        // It may have base constructor send from server.
        var classExtends = false,
          WJSClassProto,
          base = Object,
          classMethod = self.classMethods[name];
        // Or is specified into prototype.
        classExtends = classMethod && classMethod.classExtends ?
          classMethod.classExtends : classExtends;
        if (classExtends) {
          base = self.classProto(classExtends);
        }
        // Create base object.
        WJSClassProto =
          // keep a internal copy.
          self.classProtos[name] = function () {
            var self = this;
            // All object generated by wjs has a constructor.
            return (self.__construct) ?
              self.__construct.apply(self, arguments) : null;
          };
        // Append base constructor.
        WJSClassProto.prototype = Object.create(base.prototype);
        // Adjust constructor to make instanceof works,
        self.extendObject(WJSClassProto.prototype, {
          constructor: base,
          className: name,
          wjs: this
        });
      }
      // Add extra method even constructor exists,
      // in case of prototype have been extended
      // after first constructor creation.
      if (self.classMethods[name]) {
        self.extendProto(
          self.classProtos[name].prototype,
          self.classMethods[name]
        );
      }
      return self.classProtos[name];
    },

    /**
     * Remove prototype definition to wjs.
     * @param {string} name
     */
    classProtoDestroy: function (name) {
      var self = this;
      if (self.classProtos[name]) {
        delete self.classProtos[name];
      }
      if (self.classMethods[name]) {
        delete self.classMethods[name];
      }
    },

    cacheHandle: function (extType, extName, data) {
      var self = this,
        handler = self.loaders[extType].cacheHandler[extName],
        buffer = self.cacheBuffer;
      // A cache link has called this method,
      // before than a script asked for the extension.
      // We store result for further use.
      if (!handler) {
        buffer[extType] = buffer[extType] || {};
        buffer[extType][extName] = data;
      }
      // The extension has been asked,
      // the process is waiting for the cache result.
      else {
        handler.cacheHandle(extType, extName, data);
      }
    },

    /**
     * Listen for the load event, limited
     * by a timeout
     * @param {object} dom
     * @param {Function} callback
     */
    onload: function (dom, callback) {
      var loaded = false, callbackLauncher = function () {
        loaded = true;
        dom.removeEventListener('load', callbackLauncher);
        callback();
      };
      dom.addEventListener('load', callbackLauncher);
      // Protect load errors with a timeout.
      this.window.setTimeout(function () {
        if (!loaded) {
          callback();
        }
      }, 200);
    },

    /**
     * Thrown wjs specific error.
     * @param {string} message
     * @param {boolean=} fatal
     */
    err: function (message, fatal) {
      var errorPrefix = '[wjs error] : ';
      if (!fatal && this.window.console) {
        this.window.console.error(errorPrefix + message);
      }
      else {
        throw new Error(errorPrefix + message);
      }
    }
  };
  // Create global instance, using version number.
  context['wjs-' + wjsVersion] = new WJSProto();
  // Add global wjs only once.
  if (!context.wjs) {
    context.wjs = context['wjs-' + wjsVersion];
  }
  // [-->
}(window));
