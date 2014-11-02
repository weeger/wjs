/**
 * Loader manage actions to do when requesting a new extension.
 * It is a collection of hooks called on requesting / parsing /
 * deleting extensions. It may use process to help it,
 * but keep in mind that processes can load and parse
 * multiple scripts in the same time.
 * @param {WjsProto} wjs
 */
(function (context) {
  'use strict';
  // <--]
  /** @constructor */
  context.wjs.classExtend('WjsLoader', {
    type: 'undefined',
    preventReload: true,

    __construct: function () {
      var self = this;
      // Generate base hook name
      self.parseHook = 'parse' + self.type;
      // Hooks can be a chain of
      while (typeof self.parseHook === 'string') {
        self.parseHook = self[self.parseHook] || false;
      }
    },

    /**
     * Retrieve requested extension.
     * This function may be overridden by subclasses.
     * @param {string} name
     * @param {Object} options
     */
    extLoad: function (name, options) {
      // We need to split options between process and request,
      // a process can handle multiple requests.
      this.processSingle(options, {
        mode: 'server',
        name: name,
        excludeRequire: options.excludeRequire
      });
    },

    /**
     * Hook called by wjs on destroying extension.
     * @param {string} name
     * @param {?} data
     */
    extDestroy: function (name, data) {
      // To override...
    },

    /**
     * Create a process, with a single request,
     * and launch it.
     * @param {Object} processOptions
     * @param {Object} requestOptions
     */
    processSingle: function (processOptions, requestOptions) {
      // Force process type.
      requestOptions.type = this.type;
      /** @type {WJSProcessProto} */
      var process = new this.wjs.processProto(
        this.wjs.extendOptions({
            // We filter options manually here,
            async: processOptions.async,
            complete: processOptions.complete
          },
          // Add type / name of the main requested object,
          // @see process prototype.
          {
            mainType: this.type,
            mainName: requestOptions.name
          }
        ));
      process.extRequestAdd(requestOptions);
      process.loadingStart();
    },

    /**
     * Defines what to do with loaded script data.
     * @param {string} extensionName
     * @param {string} extensionData
     */
    responseParseItem: function (extensionName, extensionData, process) {
      var output, require, self = this, requireKey = '#require';
      // Load required elements first.
      if (extensionData[requireKey] !== undefined) {
        // Save requirements, it allows to delete
        // dependencies on object destroy.
        self.wjs.extRequire[self.type][extensionName] =
          self.wjs.extRequire[self.type][extensionName] || {};
        self.wjs.extendObject(
          self.wjs.extRequire[self.type][extensionName],
          extensionData[requireKey]);
        // Requirement may be already parsed before this item.
        if (self.requireMissing(extensionData[requireKey])) {
          // Local save.
          require = extensionData[requireKey];
          // Delete requirement for further loop.
          extensionData[requireKey] = undefined;
          // Launch pull.
          self.wjs.extPullMultiple(require);
          // Stop parsing at this point,
          // item has not been marked as complete,
          // so it will be parsed again on next iteration,
          // until all requirements are parsed.
          return;
        }
      }
      // By default save raw data.
      output = extensionData['#data'];
      // Let loader manage own parsing method.
      if (self.parseHook) {
        output = self.parseHook(extensionName, output, process);
      }
      if (output !== false) {
        process.parseItemComplete(self.type, extensionName, output);
      }
    },

    /**
     * Return true if a requested extension is not loaded.
     * @param {Object} requireList
     * @return {boolean}
     */
    requireMissing: function (requireList) {
      var requireExtensionType, i, length;
      for (requireExtensionType in requireList) {
        if (requireList.hasOwnProperty(requireExtensionType)) {
          for (i = 0, length = requireList[requireExtensionType].length;
               i < length; i++) {
            if (this.wjs.extGet(requireExtensionType,
              requireList[requireExtensionType][i]) === false) {
              return true;
            }
          }
        }
      }
      return false;
    }
  });
  // [-->
}(window));
