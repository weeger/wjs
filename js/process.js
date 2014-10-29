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
   * @param {Object=} options
   * @constructor
   */
  var WJSProcessProto = function (options) {
    options = options || {};
    // Default values
    wjs.extendObject(this, {
      /** @type {WJSProto} */
      wjs: wjs,
      /** @type {Object.Object} */
      parseQ: {},
      /** @type {boolean} Async mode is specified for whole process. */
      async: options.async || false,
      /** @type {Function} */
      completeCallback: options.complete,
      /** @type {boolean} */
      loadingStarted: false,
      /** @type {Array.Object} */
      extRequests: [],
      // Save which extension we should return at the end
      // of the process, even several content is returned into
      // the response package.
      /** @type {string} */
      mainType: options.mainType,
      /** @type {string} */
      mainName: options.mainName
    });
    // Save it into w.
    wjs.processes.push(this);
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
        self.wjs.error('Try to add extensions request after process start.');
      }
    },

    /**
     * Launch retrieving.
     */
    loadingStart: function () {
      var i,
        self = this,
        requests = self.extRequests,
        length = self.extRequests.length,
        serverRequest = {},
        responsePackage = {};
      self.loadingStarted = true;
      // Treat requests list.
      for (i = 0; i < length; i++) {
        switch (requests[i].mode) {
          case 'server':
            // Build query for server.
            serverRequest['wjs[' + i + '][t]'] = requests[i].type;
            serverRequest['wjs[' + i + '][n]'] = requests[i].name;
            break;
          case 'parse':
            if (responsePackage[requests[i].type] === undefined) {
              responsePackage[requests[i].type] = {};
            }
            responsePackage[requests[i].type][requests[i].name] =
            {'#data': true};
            break;
        }
      }
      // Do we need a server request.
      if (!self.wjs.objectIsEmpty(serverRequest)) {
        // Launch AJAX call.
        self.wjs.remoteRequest({
          url: self.wjs.settings.responsePath + '?' +
            self.wjs.param(serverRequest) +
            self.wjs.settings.responseQueryExtraParam,
          method: 'GET',
          async: self.async,
          success: function (data) {
            // Add retrieved data to response package.
            self.wjs.extendObject(responsePackage,
              JSON.parse(data.responseText));
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
     */
    loadingComplete: function () {
      var self = this;
      // Remove this element from processes.
      self.wjs.processes.splice(self.wjs.processes.indexOf(self), 1);
      // Execute complete callback.
      if (typeof self.completeCallback === 'function') {
        var arg;
        if (self.mainType && self.mainName) {
          arg = self.wjs.extLoaded[self.mainType][self.mainName];
        }
        // Pass complete arguments.
        self.completeCallback(arg);
      }
      // Protect against modification, object should be eligible
      // for garbage collection.
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
      self.wjs.extendObject(self.parseQ, response);
      // Launch first item parsing.
      self.responseParseNext();
    },

    /**
     * Launch parsing of next item in the parse queue.
     */
    responseParseNext: function () {
      var self = this,
        extensionsType,
        extensionsName,
        queue = self.parseQ;
      // Pass trough each kind of data.
      for (extensionsType in queue) {
        if (queue.hasOwnProperty(extensionsType) &&
          // Type must also exists in registered loaders.
          self.wjs.loaders[extensionsType]) {
          for (extensionsName in queue[extensionsType]) {
            if (queue[extensionsType].hasOwnProperty(extensionsName)) {
              self.responseParseItem(extensionsType, extensionsName);
              // We stop to the first matched item.
              // Next treatment should be launched by parsing function.
              // It allows to treat asynchronous parsing, like files loading.
              return;
            }
          }
        }
      }
      // At the end of loading, queue must be empty.
      // If not, may be an unknown script is present in
      // the returned package.
      if (!self.wjs.objectIsEmpty(queue)) {
        self.wjs.error('Parse queue not empty.');
      }
      self.loadingComplete();
    },

    /**
     * Create a specific function allows to parse item from
     * external context, like in requirement treatment.
     * @param {string} extensionType
     * @param {string} extensionName
     */
    responseParseItem: function (extensionType, extensionName) {
      var self = this;
      // Parse using according loader.
      self.wjs.loaderGet(extensionType)
        .responseParseItem(
          extensionName,
          self.parseQ[extensionType][extensionName],
          self);
    },

    /**
     * @param {string} extensionType
     * @param {string} extensionName
     * @param {?} saveData
     */
    parseItemComplete: function (extensionType, extensionName, saveData) {
      var self = this;
      // Save.
      self.wjs.extLoaded[extensionType][extensionName] = saveData;
      // Remove from queue.
      delete self.parseQ[extensionType][extensionName];
      if (self.wjs.objectIsEmpty(self.parseQ[extensionType])) {
        delete self.parseQ[extensionType];
      }
      self.responseParseNext();
    }
  };
  // We save reference to prototype into wjs.
  context.wjs.processProto = WJSProcessProto;
  // [-->
}(window));
