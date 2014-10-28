/**
 * Loading process.
 * Wjs allow to load multiple loading processes.
 * Each process can load a script or a collection of different scripts
 * and can execute a "complete" callback when finished.
 * This is useful when loading is asynchronous and allows
 * to launch several processes separately.
 * @param {WjsProto} wjs
 */
(function (wjs) {
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
      extensionRequests: [],
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
      // Prevent to add request after starting retrieving.
      if (this.loadingStarted === false) {
        this.extensionRequests.push(requestData);
      }
      else {
        this.wjs.error('Try to add extensions request after process start.');
      }
    },

    /**
     * Launch retrieving.
     */
    loadingStart: function () {
      this.loadingStarted = true;
      var i,
        requests = this.extensionRequests,
        length = this.extensionRequests.length,
        serverRequest = {},
        responsePackage = {};
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
      if (!this.wjs.objectIsEmpty(serverRequest)) {
        // Launch AJAX call.
        this.wjs.remoteRequest({
          url: this.wjs.settings.responsePath + '?' +
            this.wjs.param(serverRequest) +
            this.wjs.settings.responseQueryExtraParam,
          method: 'GET',
          async: this.async,
          success: function (data) {
            // Add retrieved data to response package.
            this.wjs.extendObject(responsePackage,
              JSON.parse(data.responseText));
            // We parse response as json in all cases.
            this.responseParse(responsePackage);
          }.bind(this)
        });
      }
      else {
        this.responseParse(responsePackage);
      }
    },

    /**
     * Callback when all request complete,
     * only one complete callback after start.
     */
    loadingComplete: function () {
      // Remove this element from processes.
      this.wjs.processes.splice(this.wjs.processes.indexOf(this), 1);
      // Execute complete callback.
      if (typeof this.completeCallback === 'function') {
        var arg;
        if (this.mainType && this.mainName) {
          arg = this.wjs.extLoaded[this.mainType][this.mainName];
        }
        // Pass complete arguments.
        this.completeCallback(arg);
      }
      // Protect against modification, object should be eligible
      // for garbage collection.
      Object.freeze(this);
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
      // Add data to parse queue.
      this.wjs.extendObject(this.parseQ, response);
      // Launch first item parsing.
      this.responseParseNext();
    },

    /**
     * Launch parsing of next item in the parse queue.
     */
    responseParseNext: function () {
      var extensionsType,
        extensionsName,
        queue = this.parseQ;
      // Pass trough each kind of data.
      for (extensionsType in queue) {
        if (queue.hasOwnProperty(extensionsType) &&
          // Type must also exists in registered loaders.
          this.wjs.loaders[extensionsType]) {
          for (extensionsName in queue[extensionsType]) {
            if (queue[extensionsType].hasOwnProperty(extensionsName)) {
              this.responseParseItem(extensionsType, extensionsName);
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
      if (!this.wjs.objectIsEmpty(queue)) {
        this.wjs.error('Parse queue not empty.');
      }
      this.loadingComplete();
    },

    /**
     * Create a specific function allows to parse item from
     * external context, like in requirement treatment.
     * @param {string} extensionType
     * @param {string} extensionName
     */
    responseParseItem: function (extensionType, extensionName) {
      // Parse using according loader.
      this.wjs.loaderGet(extensionType)
        .responseParseItem(
          extensionName,
          this.parseQ[extensionType][extensionName],
          this);
    },

    /**
     * @param {string} extensionType
     * @param {string} extensionName
     * @param {?} saveData
     */
    parseItemComplete: function (extensionType, extensionName, saveData) {
      // Save.
      this.wjs.extLoaded[extensionType][extensionName] = saveData;
      // Remove from queue.
      delete this.parseQ[extensionType][extensionName];
      if (this.wjs.objectIsEmpty(this.parseQ[extensionType])) {
        delete this.parseQ[extensionType];
      }
      this.responseParseNext();
    }
  };
  // We save reference to prototype into wjs.
  wjs.processProto = WJSProcessProto;
  // [-->
}(wjs));
