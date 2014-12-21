/**
 * Loading process.
 * Wjs allow to load multiple loading processes.
 * Each process can load a script or a collection of different scripts
 * and can execute a "complete" callback when finished.
 * This is useful when loading is asynchronous and allows
 * to launch several processes separately.
 * @param {WjsProto} wjs
 */
(function (context) {
  'use strict';
  // <--]
  /**
   * We don't use classExtend, given that
   * processes does not use class inheritances.
   * @param {Object=} options
   * @constructor
   */
  var WJSProcessProto = function (options) {
    var self = this;
    options = options || {};
    // Default values
    context.wjs.extendObject(self, {
      /** @type {WJSProto} */
      wjs: context.wjs,
      /** @type {Object.Object} */
      parseQ: {},
      /** @type {boolean} Async mode is specified for whole process. */
      async: options.async || false,
      /** @type {Function} */
      callbacks: options.complete ? [options.complete] : [],
      /** @type {boolean} */
      loadingStarted: false,
      /** @type {Array.Object} */
      extRequests: [],
      /** @type {boolean} */
      exclude: options.exclude,
      // Save which extension we should return at the end
      // of the process, even several content is returned into
      // the response package.
      /** @type {string} */
      mainType: options.mainType,
      /** @type {string} */
      mainName: options.mainName
    });
    // Save it into w.
    self.wjs.processes.push(self);
  };

  WJSProcessProto.prototype = {

    /**
     * Add a request to the process, all requests will
     * be launched in one time.
     * @param {Object} requestData
     */
    extRequestAdd: function (requestData) {
      var self = this;
      // Prevent to add request after starting retrieving.
      if (self.loadingStarted === false) {
        self.extRequests.push(requestData);
      }
      else {
        self.wjs.err('Try to add extensions request after process start.');
      }
    },

    /**
     * Launch retrieving.
     */
    loadingStart: function () {
      var i, key,
        self = this,
        wjs = self.wjs,
        requests = self.extRequests,
        request,
        settings = wjs.settings,
        serverRequest = {},
        responsePackage = {};
      self.loadingStarted = true;
      // Treat requests list.
      for (i = 0; i < requests.length; i++) {
        request = requests[i];
        switch (request.mode) {
          case 'server':
            // Build query for server.
            key = settings.paramInc + '[' + request.type + ']';
            serverRequest[key] = serverRequest[key] ? serverRequest[key] + ',' + request.name : request.name;
            break;
          case 'parse':
            responsePackage[request.type] = responsePackage[request.type] || {};
            responsePackage[request.type][request.name] =
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
        // Launch AJAX call.
        wjs.ajax({
          url: settings.responsePath + '?' +
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
     * @param {boolean} silent Set to true avoid callbacks calls.
     */
    loadingComplete: function (silent) {
      var self = this, wjs = self.wjs, arg;
      // Remove this element from processes.
      wjs.processes.splice(wjs.processes.indexOf(self), 1);
      // Execute complete callback.
      if (!silent) {
        wjs.callbacks(self.callbacks, [wjs.get(self.mainType, self.mainName)]);
      }
      // Protect against modification, object
      // should be eligible for garbage collection.
      Object.freeze(self);
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
      var self = this;
      // Add data to parse queue.
      self.wjs.extendObject(self.parseQ, response, true);
      // Search once more for loaders.
      self.wjs.loadersExists(Object.keys(self.parseQ), function () {
        // Launch first item parsing.
        self.responseParseNext();
      });
    },

    /**
     * Launch parsing of next item in the parse queue.
     */
    responseParseNext: function () {
      var self = this, wjs = self.wjs, extNext;
      while (extNext = wjs.queueNext(self.parseQ)) {
        if (!wjs.get(extNext.type, extNext.name)) {
          self.responseParseItem(extNext.type, extNext.name);
          // We stop to the first matched item.
          // Next treatment should be launched by parsing function.
          // It allows to treat asynchronous parsing, like files.
          return;
        }
        else {
          wjs.queueRem(self.parseQ, extNext.type, extNext.name);
        }
      }
      // At the end of loading, queue must be empty.
      // If not, may be an unknown script is present in
      // the returned package.
      if (Object.keys(self.parseQ).length > 0) {
        self.wjs.err('Parse queue not empty.');
      }
      self.loadingComplete();
    },

    /**
     * Create a specific function allows to parse item from
     * external context, like in requirement treatment.
     * @param {string} extensionType
     * @param {string} extensionName
     */
    responseParseItem: function (extensionType, extensionName, callback) {
      var self = this, wjs = self.wjs,
        output, require,
        requireKey = '#require',
        callbackKey = '#callbacks',
        extensionData = self.parseQ[extensionType][extensionName],
        url;
      // parseQ contains a editable object, we use it to store
      // callbacks, they will wait for parse complete.
      // These callbacks are different from request callbacks,
      // they are executed at the end of parsing only and are
      // used internally to manage requests queues an dependencies.
      if (callback) {
        extensionData[callbackKey] = extensionData[callbackKey] || [];
        extensionData[callbackKey].push(callback);
      }
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
          // before starting parsing, we just hav to
          // load missing requirements.
          wjs.use(require, function () {
            self.responseParseItem(extensionType, extensionName);
          });
          // Stop parsing at this point,
          // item has not been marked as complete,
          // so it will be parsed again on next iteration,
          // until all requirements are parsed.
          return;
        }
      }
      // This is a cached content.
      if (typeof extensionData['#data'] === 'string' &&
        extensionData['#data'].indexOf('cache://') === 0) {
        // Go to search if cached data have been stored
        // into buffer, before to parse this extension.
        if (wjs.cacheBuffer[extensionType] && wjs.cacheBuffer[extensionType][extensionName]) {
          self.cacheHandle(extensionType, extensionName, wjs.cacheBuffer[extensionType][extensionName]);
        }
        else {
          // If not, cache file have not been already loaded,
          // so we wait for load, it will execute cacheHandle.
          // It will need to access to this process, using cacheHandler.
          wjs.loaders[extensionType].cacheHandler[extensionName] = self;
        }
        return;
      }
      // If data is not cached.
      self.cacheHandle(extensionType, extensionName, extensionData['#data']);
    },

    cacheHandle: function (extensionType, extensionName, data) {
      var self = this,
        wjs = self.wjs,
      // Local copy prevent global loader deletion
      // before the end on this script.
        loader = wjs.loaders[extensionType],
        buffer = wjs.cacheBuffer[extensionType],
        handler = loader.cacheHandler,
      // By default save raw data.
        output = loader.parse(extensionName, data, self);
      // Manage cache.
      // Remove handler for this extension.
      if (handler[extensionName]) {
        delete handler[extensionName];
      }
      // Cleanup buffer.
      if (buffer && buffer[extensionName]) {
        delete buffer[extensionName];
        if (wjs.objectIsEmpty(buffer)) {
          delete wjs.cacheBuffer[extensionType];
        }
      }
      // If loader parsing returns false, complete will
      // be handled by it, maybe asynchronously.
      if (output !== false) {
        self.parseItemComplete(extensionType, extensionName, output);
      }
    },

    /**
     * Return true if a requested extension is not loaded.
     * @param {Object} requireList
     * @return {boolean}
     */
    requireMissing: function (requireList) {
      var i, j, keys = Object.keys(requireList);
      for (i = 0; i < keys.length; i++) {
        for (j = 0; j < requireList[keys[i]].length; j++) {
          if (this.wjs.get(keys[i], requireList[keys[i]][j]) === false) {
            return true;
          }
        }
      }
      return false;
    },

    /**
     * @param {string} extensionType
     * @param {string} extensionName
     * @param {?} saveData
     */
    parseItemComplete: function (extensionType, extensionName, saveData) {
      var self = this, callback = self.parseQ[extensionType][extensionName]['#callbacks'];
      // Save.
      self.wjs.extLoaded[extensionType][extensionName] = saveData;
      // Remove from queue.
      self.wjs.queueRem(self.parseQ, extensionType, extensionName);
      if (callback) {
        self.wjs.callbacks(callback);
      }
      else {
        // Go to next item.
        self.responseParseNext();
      }
    }
  };
  // We save reference to prototype into wjs.
  context.wjs.processProto = WJSProcessProto;
  // [-->
}(window));
