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
  WjsProto.lib.Process = {
    // Add static and non objects parameters.
    phase: 0,
    /** @type {Array} Boot phases. */
    phases: [
      'bootIsReload',
      'bootRequestFilter',
      'bootGetLoaders',
      'bootFilterLoaders',
      'processStart'
    ],

    __construct: function (request, options) {
      var wjs = this.wjs;
      // Turn options to object.
      options = wjs.extendOptions(options);
      // Default values
      wjs.extendObject(this, {
        /** @type {Number} */
        id: wjs.processCounter++,
        /** @type {Object} Request can be empty, like on startup. */
        request: request || {},
        /** @type {boolean} Use or destroy request. */
        destroy: options.destroy || false,
        /** @type {boolean} Async mode is specified for whole process. */
        async: options.async !== false,
        /** @type {Object} Keep reference for extra options. */
        options: options,
        /** @type {Object} Package to parse after request. */
        response: options.response || {},
        /** @type {Object} */
        parseQ: {},
        /** @type {Function} */
        callbacks: options.complete ? [options.complete] : [],
        /** @type {boolean} */
        exclude: options.exclude,
        /** @type {Object} Used stack. */
        stack: options.stack === false ? false : (options.stack || wjs.stackCurrent || wjs.stack),
        /** @type {Object} Internal stack for child processes. */
        stackInternal: [],
        /** @type {Object} Registry of parsed data. */
        output: {},
        /** @type {Function} Shorthand */
        reboot: this.boot.bind(this),
        /** @type {Function} Bind callback function */
        responseParseNextProxy: this.responseParseNext.bind(this)
      });
      // Save it into w.
      wjs.processes[this.id] = this;
      // Run.
      if (this.stack) {
        // Append to queue.
        this.stack.push(this);
        // Start if not started.
        if (!this.stack.started) {
          // Save prop into array.
          this.stack.started = true;
          // Boot.
          this.stackNext();
        }
      }
      // Non stacked process..
      else {
        this.boot();
      }
    },

    /**
     * Start process boot phases.
     */
    boot: function () {
      // Phase must return true if not async,
      // otherwise it will reboot itself.
      if (this[this.phases[this.phase]]()) {
        // Ask for nex phase.
        this.phase++;
        // Reboot.
        this.boot();
      }
    },

    bootIsReload: function () {
      if (this.options.reload) {
        // Reboot only once.
        this.phase++;
        // Launch destroy.
        this.wjs.destroy(this.request, {
          stack: false,
          complete: this.reboot
        });
        // Stop boot process.
        return false;
      }
      // Continue.
      return true;
    },

    bootRequestFilter: function () {
      var self = this, wjs = self.wjs,
        requestFiltered = {};
      // Verify if all extension need to be
      // requested, and if another process
      // is not currently parsing it.
      if (wjs.regEach(this.request, function (type, name) {
        var i = 0, key, keys, output = self.output,
          extensionData = wjs.get(type, name);
        // Append data directly to process output if already exists,
        // no extra processing will be made for it.
        if (extensionData && !self.destroy) {
          output[type] = output[type] || {};
          output[type][name] = extensionData;
        }
        else {
          var processQueued;
          // Search if a process is not currently
          // waiting to be parsed, and containing requested data,
          // in this case, current process will be delayed again.
          keys = Object.keys(wjs.processes);
          while (key = keys[i++]) {
            processQueued = wjs.processes[key];
            // Processes types of destroy / non destroy
            // must be treated separately.
            if (!Object.isFrozen(processQueued) &&
              processQueued.destroy === self.destroy &&
              processQueued.parseQ[type] &&
              processQueued.parseQ[type][name]) {
              // A process is about to parse requested extension,
              // We enforce process to parse it now before launching this one again.
              processQueued.itemProcess(type, name, self.reboot);
              // Stop iteration.
              return false;
            }
          }
          // Append to filtered request.
          requestFiltered[type] = requestFiltered[type] || [];
          requestFiltered[type].push(name);
        }
      })) {
        this.request = requestFiltered;
        // Returning true continue boot process.
        return true;
      }
      // Returning nothing will stop boot process.
    },

    bootGetLoaders: function () {
      var self = this;
      // Wait for next boot.
      self.phase++;
      // Launch loaders load
      self.wjs.loadersExists(Object.keys(self.request), this.reboot);
      // return null will stop boot process.
    },

    bootFilterLoaders: function () {
      var requestFiltered = {}, keys = Object.keys(this.request), key, i = 0;
      while (key = keys[i++]) {
        if (this.wjs.loaders[key]) {
          requestFiltered[key] = this.request[key];
        }
      }
      this.request = requestFiltered;
      return true;
    },

    processStart: function () {
      var self = this, wjs = self.wjs, i = 0, key,
        request, serverRequest = {},
        response = this.response,
        settings = wjs.settings,
        hook = 'request' + (self.destroy ? 'Destroy' : 'Use');
      // Create request.
      wjs.regEach(this.request, function (type, name) {
        var item = wjs.loaders[type][hook](name, self);
        switch (item.mode) {
          // Request need to ask server.
          case 'server':
            // Build query for server.
            key = settings.paramInc + '[' + type + ']';
            serverRequest[key] = serverRequest[key] ? serverRequest[key] + ',' + name : name;
            break;
          // Loader only know what to do.
          case 'parse':
            response[type] = response[type] || {};
            response[type][name] = {'#data': item.data};
            break;
        }
      });
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
          success: function (data) {
            // Add retrieved data to response package.
            wjs.extendObject(response,
              JSON.parse(data.responseText), true);
            // We parse response as json in all cases.
            self.responseParse(response);
          }
        });
      }
      else {
        self.responseParse(response);
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
        if (self.async) {
          // Breaking stack prevent overflows.
          wjs.async(self.responseParseNextProxy);
        }
        else {
          // Launch first item parsing.
          self.responseParseNext();
        }
      });
    },

    responseParseNext: function () {
      var wjs = this.wjs,
        extNext, queue = this.parseQ;
      // Retrieve next item.
      if (extNext = wjs.regNext(queue)) {
        this.itemProcess(extNext.type, extNext.name);
        return;
      }
      // At the end of loading, queue must be empty.
      // If not, may be an unknown script is present in
      // the returned package.
      if (Object.keys(queue).length > 0) {
        this.wjs.err('Parse queue not empty.');
      }
      this.processComplete();
    },

    itemProcess: function (extensionType, extensionName, callback) {
      var extensionData = this.parseQ[extensionType][extensionName];
      // parseQ contains a editable object, we use it to store
      // callbacks, they will wait for parse complete.
      // These callbacks are different from request callbacks,
      // they are executed at the end of parsing only and are
      // used internally to manage request queues an dependencies.
      if (callback) {
        extensionData['#callback'] = callback;
      }
      if (this.destroy) {
        this.itemDestroy(extensionType, extensionName);
      }
      // Process can retrieve already loaded extensions
      // so we have to check again if it is not already saved.
      else if (this.wjs.get(extensionType, extensionName) === false) {
        this.itemParse(extensionType, extensionName, extensionData);
      }
      else {
        // Remove from queue and execute callbacks if present.
        this.itemProcessComplete(extensionType, extensionName);
        // No parsing launched.
        return false;
      }
      // Parsing launched.
      return true;
    },

    /**
     * Create a specific function allows to parse item from
     * external context, like in requirement treatment.
     */
    itemParse: function (extensionType, extensionName, extensionData) {
      var self = this, wjs = self.wjs,
        require, extRequire = wjs.extRequire,
        requireKey = '#require', queue = self.parseQ,
        reload = function () {
          self.itemParse(extensionType, extensionName, extensionData);
        };
      // Save requirements, it allows to delete
      // dependencies on object destroy.
      extRequire[extensionType][extensionName] =
        extRequire[extensionType][extensionName] || {};
      // Load required elements first.
      if (extensionData[requireKey]) {
        wjs.extendObject(
          extRequire[extensionType][extensionName],
          extensionData[requireKey]);
        // Requirement may be already parsed before this item.
        if (self.requireMissing(extensionData[requireKey])) {
          // Iterates over requirement, if one of them is found
          // into current queue, process item after checking
          // if loader exists. If any item is found into queue,
          // we launch a request with all required items,
          // existing items will be filtered by the new process.
          if (wjs.regEach(extensionData[requireKey], function (type, name) {
            // Item is into current queue.
            if (queue[type] && queue[type][name]) {
              // Check first if loader exists.
              wjs.loadersExists([type], function () {
                // Process item, then reload this method.
                self.itemProcess(type, name, reload);
              });
              // Stop process and avoid use request.
              return false;
            }
          })) {
            // Delete requirement for further loop.
            extensionData[requireKey] = undefined;
            // Missing loaders are retrieved by process
            // before starting parsing, we just have to
            // load other missing extensions.
            wjs.use(extensionData[requireKey], {
              stack: false,
              complete: reload
            });
          }
          // Stop parsing at this point.
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
    itemParseSave: function (extensionType, extensionName, extensionData) {
      var wjs = this.wjs, output,
      // Local copy prevent global loader deletion
      // before the end on this script.
        loader = wjs.loaders[extensionType];
      // Handle errors.
      if (typeof extensionData === 'string' && extensionData.indexOf('WJS5_ERR_') === 0) {
        // Throw custom error.
        wjs.err('Parse error for ' + extensionType + '::' + extensionName + ' : ' + extensionData);
        // Convert data to error object.
        output = new wjs.window.Error(extensionData);
      }
      else {
        // By default save raw data.
        output = loader.parse(extensionName, extensionData, this);
      }
      // If loader parsing returns false, complete will
      // be handled by it, maybe asynchronously.
      if (output !== false) {
        this.itemParseComplete(extensionType, extensionName, output);
      }
    },

    /**
     * @param {string} extensionType
     * @param {string} extensionName
     * @param {?} saveData
     */
    itemParseComplete: function (extensionType, extensionName, saveData) {
      var output = this.output, extLoaded = this.wjs.extLoaded;
      // Handle errors for missing loaders.
      if (extLoaded[extensionType]) {
        // Save into wjs.
        extLoaded[extensionType][extensionName] = saveData;
        // Save as output for callbacks functions.
        output[extensionType] = output[extensionType] || {};
        output[extensionType][extensionName] = saveData;
      }
      this.itemProcessComplete(extensionType, extensionName);
    },

    /**
     * Destroy a requested item.
     */
    itemDestroy: function (extensionType, extensionName) {
      var extensionData = this.wjs.get(extensionType, extensionName),
        loader = this.wjs.loaders[extensionType];
      if (!loader || extensionData === false || loader.destroy(extensionName, extensionData, this) !== false) {
        this.itemDestroyComplete(extensionType, extensionName);
      }
    },

    /**
     * Handle completed destruction.
     * @param {string=} extensionType
     * @param {string=} extensionName
     */
    itemDestroyComplete: function (extensionType, extensionName) {
      var self = this, wjs = self.wjs, cacheRegName = extensionType + '::' + extensionName, cacheLink = wjs.cacheReg[cacheRegName],
      // Get deletable dependencies.
        deletable = self.options.dependencies ? wjs.requirementsDeletable(extensionType, extensionName) : false;
      // Remove dependencies.
      delete wjs.extRequire[extensionType][extensionName];
      // Remove entry.
      delete wjs.extLoaded[extensionType][extensionName];
      // Remove cache if exists.
      if (cacheLink) {
        // Add link to destroyed extensions.
        wjs.extendObject(deletable, wjs.requirementsDeletable('CacheLink', cacheLink));
        // Remove entry.
        delete self.wjs.cacheReg[cacheRegName];
      }
      // Launch dependencies deletion.
      if (deletable && Object.keys(deletable).length) {
        wjs.destroy(deletable, {
          stack: false,
          dependencies: true,
          complete: function () {
            self.itemDestroyComplete(extensionType, extensionName);
          }
        });
        return;
      }
      this.itemProcessComplete(extensionType, extensionName);
    },

    /**
     * Complete process for both parse and destroy.
     */
    itemProcessComplete: function (extensionType, extensionName) {
      var wjs = this.wjs, callback = this.parseQ[extensionType][extensionName]['#callback'];
      // Remove from queue, avoid recursion.
      this.wjs.regRem(this.parseQ, extensionType, extensionName);
      // Go to next item.
      // Launch _internal_ callback,
      // no need to change global stack context.
      if (callback) {
        wjs.async(callback);
      }
      else {
        this.responseParseNext();
      }
    },

    /**
     * Callback when all request complete,
     * only one complete callback after start.
     */
    processComplete: function () {
      var wjs = this.wjs;
      // Remove this element from processes.
      delete wjs.processes[this.id];
      // Protect against modification, object
      // should be eligible for garbage collection.
      Object.freeze(this);
      // Execute complete callback.
      if (this.callbacks.length) {
        var stackCurrent = wjs.stackCurrent;
        wjs.stackCurrent = this.stackInternal;
        wjs.callbacks(this.callbacks, [this.output, this]);
        wjs.stackCurrent = stackCurrent;
      }
      // Continue processes queue.
      if (this.stack) {
        this.stackNext();
      }
    },

    /**
     * Return true if a requested extension is not loaded.
     * @param {Object} requireList
     * @return {boolean}
     */
    requireMissing: function (requireList) {
      var missing = false;
      this.wjs.regEach(requireList, function (type, name) {
        if (this.get(type, name) === false) {
          missing = true;
          return false;
        }
      });
      return missing;
    },

    stackNext: function () {
      if (this.stack.length) {
        this.stack.shift().boot();
      }
      else {
        this.stack.started = false;
      }
    }
  };
  // [-->
}(WjsProto));
