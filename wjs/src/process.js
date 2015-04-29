/**
 * Loading process.
 * Wjs allow to load multiple loading processes.
 * Each process can load a script or a collection of different scripts
 * and can execute a "complete" callback when finished.
 * This is useful when loading is asynchronous and allows
 * to launch several processes separately.
 * @param {WjsProto} WjsProto
 */
(function (WjsProto) {
  'use strict';
  // <--]
  WjsProto.proto.Process = {

    __construct: function (request, options, wjs) {
      var self = this;
      options = wjs.extendOptions(options || {});
      // Save the parent process locally,
      // it allow to delay process
      // with the same context.
      if (!options.processParent && wjs.processParent) {
        options.processParent = wjs.processParent;
      }
      // Default values
      wjs.extendObject(self, {
        /** @type {Number} */
        id: wjs.processCounter++,
        /** @type {WjsProto} */
        wjs: wjs,
        /** @type {boolean} */
        destroy: options.destroy || false,
        /** @type {Object} */
        booted: false,
        /** @type {Object} */
        parseQ: {},
        /** @type {boolean} Async mode is specified for whole process. */
        async: options.async || true,
        /** @type {Function} */
        callbacks: options.complete ? [options.complete] : [],
        /** @type {Array} */
        extRequests: [],
        /** @type {boolean} */
        exclude: options.exclude,
        /** @type {boolean} By default processes are queued for execution. */
        stacked: options.stacked !== undefined ? options.stacked : true,
        /** @type {Object} */
        request: request,
        /** @type {Object} Keep reference for extra options. */
        options: options,
        /** @type {Array} Processes waiting for this one to finish for boot. */
        next: [],
        /** @type {Array} */
        processStack: [],
        /** @type {Object} Registry of parsed data. */
        output: {}
      });
      // Save it into w.
      self.wjs.processes.push(self);
      // Append request.
      if (request) {
        // Make first a specific verification for loaders.
        wjs.loadersExists(Object.keys(request), function () {
          // All processes are launched in a new call stack,
          // it avoid to overflow in case of large amount of
          // dependencies calls. Wjs manage an internal stack
          // to keep order of "use" and "destroy" calls.
          self.wjs.window.setTimeout(function () {
            self.boot();
          });
        });
      }
    },

    /**
     * Start process when loaders exists checked.
     */
    boot: function () {
      var self = this,
        wjs = self.wjs,
        request = self.request,
        requestDependencies = {},
        processStack,
        responsePackage = {};
      // Prevent to boot multiple times,
      // it can occur when multiple processes
      // are launched on the same stack scope.
      if (self.booted === true) {
        return;
      }
      self.booted = true;
      // Search if a process is currently running.
      // It keep processes execution when multiple calls
      // are executed successively.
      if (self.stacked) {
        processStack = self.options.processParent ? self.options.processParent.processStack : wjs.processStack;
        // Add to process stack if not present.
        if (processStack.indexOf(this) === -1) {
          processStack.push(this);
        }
        // Process must be the next one to be processed into stack.
        if (processStack.indexOf(this) !== 0) {
          self.booted = false;
          return;
        }
      }
      // Build dependencies for destroy requests,
      // It may add extra extensions to destroy.
      if (self.destroy) {
        wjs.regEach(request, function (type, name) {
          // Build request with dependencies.
          wjs.destroyRequest(requestDependencies, type, name, self.options);
        });
        request = requestDependencies;
      }
      // Search if a process is not currently
      // working on any requested extension,
      // if yes, this process boot is queued.
      // This test is dependent to resource,
      // not to processes stack or parent.
      else if (!wjs.regEach(request, function (type, name) {
        var process = wjs.processFor(type, name);
        if (process && process !== self) {
          // Add current process to the waiting list.
          process.next.push(self);
          // Stop iteration.
          return false;
        }
      })) {
        self.booted = false;
        return;
      }
      // Verify if all extension need to be
      // requested, and if another process
      // is not currently parsing it.
      if (!wjs.regEach(request, function (type, name) {
        var i, error, processQueued,
          hook = 'request' + (self.destroy ? 'Destroy' : 'Use'),
          extensionData = wjs.get(type, name);
        // Handle reload option.
        if (extensionData && self.options.reload) {
          extensionData = false;
          delete wjs.extLoaded[type][name];
          // Remove cache response if exists.
          if (wjs.cacheReg[type + '::' + name]) {
            delete wjs.extLoaded.CacheLink[wjs.cacheReg[type + '::' + name]];
          }
        }
        // Append data to output if already exists,
        // any extra processing will be made for it.
        if (extensionData && self.destroy === false) {
          self.output[type] = self.output[type] || {};
          self.output[type][name] = extensionData;
        }
        // Check if loader exists, if not we can't
        // prepare request so we start to build response package.
        else if (!wjs.loaders[type]) {
          error = 'WJS_ERR_PULL_UNDEFINED_LOADER_TYPE';
          responsePackage[type] = responsePackage[type] || {};
          responsePackage[type][name] = {'#data': error};
          wjs.err('Load error for ' + type + '::' + name + ' : ' + error);
        }
        else {
          // Search if a process is not currently
          // waiting to be parsed, and containing requested data,
          // in this case, current process will be delayed again.
          for (i = 0; i < wjs.processes.length; i++) {
            processQueued = wjs.processes[i];
            // Processes types of destroy / non destroy
            // must be treated separately.
            if (processQueued.destroy === self.destroy &&
              processQueued.parseQ[type] &&
              processQueued.parseQ[type][name]) {
              // Stop boot.
              self.booted = false;
              // We have found a non terminated process, we shut down this one.
              self.loadingComplete(true);
              // A process is about to parse requested extension,
              // We enforce process to parse it now before launching this one again.
              processQueued.itemProcess(type, name, function () {
                // Launch request again (use or destroy).
                return wjs.process(self.request, self.options);
              });
              return false;
            }
          }
          // Item not found in another similar process, we need to
          // retrieve or destroy it. Hook loader to let it handle
          // load / destroy request format.
          self.extRequests.push(wjs.loaders[type][hook](name, self));
        }
      })) {
        // self.booted = false; is into regEach callback,
        // before object sealed.
        return;
      }
      // No conflict. Here we go.
      self.loadingStart(responsePackage);
    },

    /**
     * Launch retrieving.
     */
    loadingStart: function (responsePackage) {
      var i, key, type, name,
        self = this,
        wjs = self.wjs,
        requests = self.extRequests,
        request,
        settings = wjs.settings,
        serverRequest = {};
      // Response package can already contains data
      // like undefined loaders.
      responsePackage = responsePackage || {};
      // Treat requests list.
      for (i = 0; i < requests.length; i++) {
        request = requests[i];
        type = request.type;
        name = request.name;
        switch (request.mode) {
          case 'server':
            // Build query for server.
            key = settings.paramInc + '[' + type + ']';
            serverRequest[key] = serverRequest[key] ? serverRequest[key] + ',' + name : name;
            break;
          case 'parse':
            responsePackage[type] = responsePackage[type] || {};
            responsePackage[type][name] =
            {'#data': request.data};
            break;
        }
      }
      // Do we need a server request.
      if (!wjs.objectIsEmpty(serverRequest)) {
        // Create exclusion vars.
        // Exclusions are considered as global
        // for the hole request.
        if (self.exclude) {
          if (self.exclude === true) {
            serverRequest[settings.paramExc] = '1';
          }
          else {
            key = Object.keys(self.exclude);
            for (i = 0; i < key.length; i++) {
              serverRequest[settings.paramExc + '[' + key[i] + ']'] = self.exclude[key[i]].join(',');
            }
          }
        }
        // Append token to request,
        // if cache is enabled it will generate
        // files with the same token.
        if (settings.cacheToken) {
          serverRequest[settings.paramToken] = settings.cacheToken;
        }
        // Launch AJAX call.
        wjs.ajax({
          url: settings.pathResponse + '?' +
            wjs.param(serverRequest) +
            settings.paramExtra,
          method: 'GET',
          async: self.async,
          success: function (data) {
            // Add retrieved data to response package.
            wjs.extendObject(responsePackage,
              JSON.parse(data.responseText), true);
            // We parse response as json in all cases.
            self.responseParse(responsePackage);
          }
        });
      }
      else {
        self.responseParse(responsePackage);
      }
    },

    /**
     * Callback when all request complete,
     * only one complete callback after start.
     *
     * @param {boolean=} silent Set to true avoid callbacks calls.
     */
    loadingComplete: function (silent) {
      var self = this,
        wjs = self.wjs,
        i = 0,
        processStack,
        parent = wjs.processParent,
        stackIndex;
      // Remove this element from processes.
      wjs.processes.splice(wjs.processes.indexOf(self), 1);
      // Execute complete callback.
      if (!silent) {
        wjs.processParent = this;
        wjs.callbacks(self.callbacks, [self.output, self]);
        wjs.processParent = parent;
      }
      // Protect against modification, object
      // should be eligible for garbage collection.
      Object.freeze(self);
      // Reboot next process from stack.
      if (self.stacked) {
        processStack = self.options.processParent ? self.options.processParent.processStack : self.wjs.processStack;
        stackIndex = processStack.indexOf(self);
        // Processes can be stackable but not stacked,
        // like startup process who are not booting,
        // only directly starting.
        if (stackIndex !== -1) {
          processStack.splice(processStack.indexOf(self), 1);
          if (!silent) {
            // Reboot all stack.
            for (i = 0; i < processStack.length; i++) {
              processStack[i].boot();
            }
          }
        }
      }
      // Reboot other waiting processes.
      for (i = 0; i < self.next.length; i++) {
        self.next[i].boot();
      }
    },

    /**
     * Parse response package.
     * Response is stored as a json object : {
     *   "requestedExtensionType":{
     *     "requestedExtensionName":{
     *       "#require":{
     *          "requiredExtensionType":[
     *            "requiredExtensionName1",
     *            "requiredExtensionName2"
     *          ]
     *       },
     *       "#data":"returnedExtensionData"
     *     }
     *   }
     * }
     */
    responseParse: function (response) {
      var self = this, wjs = self.wjs, parseQ = self.parseQ;
      // Add data to parse queue.
      wjs.extendObject(parseQ, response, true);
      // Search once more for loaders.
      wjs.loadersExists(Object.keys(parseQ), function () {
        // Launch first item parsing.
        self.responseParseNext();
      });
    },

    /**
     * Launch parsing of next item in the parse queue.
     */
    responseParseNext: function () {
      var self = this, wjs = self.wjs;
      // Breaking stack prevent overflows.
      wjs.window.setTimeout(function () {
        var extNext, ObjectKeys = Object.keys, queue = self.parseQ;
        // This is a trick to not delete loaders before
        // to delete all extensions. In place of that
        // we should create sub processes (like in parse function)
        // according to objects dependencies.

        if (self.destroy && queue.WjsLoader && ObjectKeys(queue).length > 1) {
          queue = wjs.extendObject({}, queue, true);
          delete queue.WjsLoader;
        }
        // Retrieve next item.
        while (extNext = wjs.regNext(queue)) {
          if (self.itemProcess(extNext.type, extNext.name)) {
            return;
          }
          wjs.regRem(queue, extNext.type, extNext.name);
        }
        // At the end of loading, queue must be empty.
        // If not, may be an unknown script is present in
        // the returned package.
        if (ObjectKeys(queue).length > 0) {
          self.wjs.err('Parse queue not empty.');
        }
        self.loadingComplete();
      });
    },

    itemProcess: function (extensionType, extensionName, callback) {
      var self = this,
        callbackKey = '#callbacks',
        extensionData = self.parseQ[extensionType][extensionName];
      // parseQ contains a editable object, we use it to store
      // callbacks, they will wait for parse complete.
      // These callbacks are different from request callbacks,
      // they are executed at the end of parsing only and are
      // used internally to manage requests queues an dependencies.
      if (callback) {
        extensionData[callbackKey] = extensionData[callbackKey] || [];
        extensionData[callbackKey].push(callback);
      }
      if (!self.destroy) {
        // Process can retrieve already loaded extensions
        // so we have to check again if it already saved.
        if (!self.wjs.get(extensionType, extensionName)) {
          self.itemParse(extensionType, extensionName, callback);
          // We stop to the first matched item.
          // Next treatment should be launched by parsing function.
          // It allows to treat asynchronous parsing, like files.
          return true;
        }
      }
      else {
        self.itemDestroy(extensionType, extensionName, callback);
        return true;
      }
      return false;
    },

    itemProcessComplete: function (extensionType, extensionName) {
      var wjs = this.wjs, callback = this.parseQ[extensionType][extensionName]['#callbacks'];
      // Remove from queue.
      wjs.regRem(this.parseQ, extensionType, extensionName);
      // Launch callback.
      if (callback) {
        wjs.callbacks(callback);
      }
      else {
        // Go to next item.
        this.responseParseNext();
      }
    },

    /**
     * Create a specific function allows to parse item from
     * external context, like in requirement treatment.
     * @param {string} extensionType
     * @param {string} extensionName
     * @param {Function=} callback
     */
    itemParse: function (extensionType, extensionName) {
      var self = this, wjs = self.wjs,
        require,
        requireKey = '#require',
        extensionData = self.parseQ[extensionType][extensionName];
      // Load required elements first.
      if (extensionData[requireKey] !== undefined) {
        // Save requirements, it allows to delete
        // dependencies on object destroy.
        wjs.extRequire[extensionType][extensionName] =
          wjs.extRequire[extensionType][extensionName] || {};
        wjs.extendObject(
          wjs.extRequire[extensionType][extensionName],
          extensionData[requireKey]);
        // Requirement may be already parsed before this item.
        if (self.requireMissing(extensionData[requireKey])) {
          // Local save.
          require = extensionData[requireKey];
          // Delete requirement for further loop.
          extensionData[requireKey] = undefined;
          // Missing loaders are retrieved by process
          // before starting parsing, we just have to
          // load other missing extensions.
          wjs.use(require, {
            stacked: false,
            complete: function () {
              self.itemParse(extensionType, extensionName);
            }
          });
          // Stop parsing at this point,
          // item has not been marked as complete,
          // so it will be parsed again on next iteration,
          // until all requirements are parsed.
          return;
        }
      }
      // This is a cached content.
      if (typeof extensionData['#data'] === 'string' && extensionData['#data'].indexOf('cache://') === 0) {
        // Cache registry save links between extensions and
        // cache links to manage deletions and dependencies.
        wjs.cacheReg[extensionType + '::' + extensionName] = extensionData['#data'].split('://')[1];
        // Launch an event listener for cache retrieving.
        WjsProto.registerListen('cache', extensionType + '/' + extensionName, function (data) {
          // Replace cache:// link by real data into process object
          // it create a safe place where to find raw data.
          extensionData['#data'] = data;
          self.itemParseSave(extensionType, extensionName, data);
        });
        return;
      }
      // If data is not cached.
      self.itemParseSave(extensionType, extensionName, extensionData['#data']);
    },

    /**
     * The callback part of itemParse.
     */
    itemParseSave: function (extensionType, extensionName, data) {
      var self = this, wjs = self.wjs, output,
      // Local copy prevent global loader deletion
      // before the end on this script.
        loader = wjs.loaders[extensionType];
      // Handle errors.
      if (typeof data === 'string' && data.indexOf('WJS_ERR_') === 0) {
        // Throw custom error.
        wjs.err('Parse error for ' + extensionType + '::' + extensionName + ' : ' + data);
        // Convert data to error object.
        output = new wjs.window.Error(data);
      }
      else {
        // By default save raw data.
        output = loader.parse(extensionName, data, self);
      }
      // If loader parsing returns false, complete will
      // be handled by it, maybe asynchronously.
      if (output !== false) {
        self.itemParseComplete(extensionType, extensionName, output);
      }
    },

    /**
     * @param {string} extensionType
     * @param {string} extensionName
     * @param {?} saveData
     */
    itemParseComplete: function (extensionType, extensionName, saveData) {
      var self = this;
      // Handle errors for missing loaders.
      if (self.wjs.extLoaded[extensionType]) {
        // Save into wjs.
        self.wjs.extLoaded[extensionType][extensionName] = saveData;
        // Save as output for callbacks functions.
        self.output[extensionType] = self.output[extensionType] || [];
        self.output[extensionType][extensionName] = saveData;
      }
      self.itemProcessComplete(extensionType, extensionName);
    },

    /**
     * Destroy a requested item.
     * @param {string=} type
     * @param {string=} name
     */
    itemDestroy: function (type, name) {
      var self = this, wjs = self.wjs, data = wjs.get(type, name);
      if (!wjs.loaders[type] || data === false || wjs.loaders[type].destroy(name, data, self) !== false) {
        self.itemDestroyComplete(type, name);
      }
    },

    /**
     * Handle completed destruction.
     * @param {string=} extensionType
     * @param {string=} extensionName
     */
    itemDestroyComplete: function (extensionType, extensionName) {
      var wjs = this.wjs;
      if (wjs.loaders[extensionType]) {
        // Remove entry.
        delete wjs.extLoaded[extensionType][extensionName];
        delete wjs.extRequire[extensionType][extensionName];
      }
      this.itemProcessComplete(extensionType, extensionName);
    },

    /**
     * Return true if a requested extension is not loaded.
     * @param {Object} requireList
     * @return {boolean}
     */
    requireMissing: function (requireList) {
      var wjs = this.wjs, missing = false;
      wjs.regEach(requireList, function (type, name) {
        if (wjs.get(type, name) === false) {
          missing = true;
          return false;
        }
      });
      return missing;
    }
  };
  // [-->
}(WjsProto));
