(function (W) {
  'use strict';
  // Search for {{markups}} or encoded %7B%7Bmarkups%7D%7D
  var regHtmlVariable = new RegExp('(?:{|%7B){2}((?:.(?!{|%7B))*)(?:}|%7D){2}', 'g');

  W.register('WebComScheme', 'SchemeWebCom', {
    classExtends: null,
    type: 'WebCom',
    id: '',

    variables: {
      optionsInternal: {},
      optionsApplied: {},
      optionsDestroyed: {},
      optionsData: {},
      domChildren: {},
      domIncludes: [],
      classLoadsNames: ['fadeIn', 'loaded', 'fadeOut', 'fadeOutChildren'],
      // Defines if javascript has to add
      // css classes in different status,
      // created
      classLoads: {typeGlobal: true},
      cssStyleNames: {},
      readyCallbacks: [],
      requiredInstances: {},
      webComConstruct: false
    },

    options: {
      require: {
        defaults: false,
        define: function (com, value, options) {
          com.optionApply('dom', options);
          if (value) {
            com.requiredInstances = com.createInstances(value);
          }
        },
        destroy: function (com, value) {
          if (value) {
            com.destroyInstances(value, com.requiredInstances);
          }
        }
      },
      urlHistory: {
        defaults: false,
        unique: false,
        /**
         * @require JsMethod > urlQueryParse
         * @require JsMethod > urlQueryReplace
         */
        define: function (com, value) {
          if (value) {
            var w = this.w;
            // Load used class.
            var loaderType = com.loader.type,
              params = w.urlQueryParse();
            params[loaderType] = params[loaderType] || {};
            if (this.unique) {
              if (params[loaderType] !== com.type) {
                params[loaderType] = com.type;
              }
            }
            // Avoid multiple insertion.
            else {
              params[loaderType][com.id] = com.type;
            }
            // We use only query string,
            // so full path does not change.
            w.urlQueryReplace(params);
          }
        },
        /**
         * @require JsMethod > urlQueryParse
         * @require JsMethod > urlQueryBuild
         */
        destroy: function (com) {
          var loaderType = com.loader.type, params = this.w.urlQueryParse();
          if (params[loaderType]) {
            if (this.unique) {
              delete params[loaderType];
            }
            else {
              delete params[loaderType][com.id];
            }
            this.w.window.history.replaceState(null, null, '?' + this.w.urlQueryBuild(params));
          }
        }
      },

      cssClassInteraction: {
        defaults: null,
        define: function (com, value) {
          if (!value) {
            return com.typeGlobal;
          }
          return value;
        }
      },

      dom: {
        defaults: false,
        cssClasses: {
          defaults: []
        },
        /**
         * @require JsMethod > isDomNode
         * @require JsMethod > domAttributes
         */
        define: function (com, value, options) {
          // If true, or not specified but html is present.
          value = (value === true || (typeof value !== 'object' && typeof options.html === 'string')) ? 'div' : value;
          if (value) {
            // Need CSS classes to exists.
            com.optionApply('cssSheets', options);
            com.optionApply('cssClasses', options);
            com.optionApply('cssClassInteraction', options);
            com.optionApply('domImported', options);
            var i = 0, item, dom, backup = com.optionsData.dom = {}, w = this.w;
            backup.domCreated = !w.isDomNode(value);
            // Save reference.
            dom = backup.domCreated ? w.document.createElement(value) : value;
            // Backup attributes.
            backup.attributes = w.extendObject({}, w.domAttributes(dom));
            // Id can be used for css selectors.
            dom.setAttribute('id', com.id);
            // Backup current class name.
            backup.className = dom.className;
            if (com.cssClasses) {
              while (item = com.cssClasses[i++]) {
                dom.classList.add(item);
              }
            }
            // Appending element to a dom parent is managed externally.
            return dom;
          }
        },
        /**
         * @require JsMethod > wjsIncludeExit
         */
        destroy: function (com) {
          if (com.dom) {
            var item, i = 0, backup = com.optionsData.dom, objectKeys = Object.keys,
            // Get list of all attributes to inspect,
            // from current sets,
              keys = objectKeys(com.w.domAttributes(com.dom))
                // And from saved one.
                .concat(objectKeys(backup.attributes));
            // Iterates over all attributes.
            while (item = keys[i++]) {
              if (backup.attributes[item]) {
                com.dom.setAttribute(item, backup.attributes[item]);
              }
              else {
                com.dom.removeAttribute(item);
              }
            }
            // If dom has been created on define.
            if (com.domImported || com.optionsData.dom.domCreated) {
              // Destroy it.
              com.dom.parentNode.removeChild(com.dom);
            }
          }
        }
      },

      domImported: {
        // Define if dom is imported, if yes
        // it have to be destroyed with object,
        // like if it was internally created.
        defaults: false
      },

      domDestination: {
        defaults: null,
        define: function (com, value, options) {
          // Requires html && dom option.
          com.optionApply('dom', options);
          if (!value && (!com.dom || com.dom.parentNode)) {
            return;
          }
          if (com.dom && com.dom !== com.w.document.body) {
            value = value || com.w.document.body;
            if (typeof value === 'string') {
              value = com.w.document.querySelector(value);
            }
            value.appendChild(com.dom);
          }
        }
      },

      html: {
        defaults: false,
        autoInit: false,
        define: function (com, value, options) {
          if (typeof value === 'string') {
            // Requires dom option.
            com.optionApply('dom', options);
            var dom = com.domChildAdd('html', 'div', value);
          }
        }
      },

      cssSheets: {
        defaults: [],
        define: function (com, value) {
          var extRequire = com.w.extRequire[com.loader.type];
          return extRequire && extRequire[com.type] ? extRequire[com.type].CssLink : value;
        }
      },

      cssFadeIn: {
        defaults: false,
        define: function (com, value, options) {
          com.optionApply('dom', options);
          if (com.dom) {
            // Treat CSS fades.
            var classLoads = com.classLoads,
              i, item,
              cssSheets = com.cssSheets;
            // There is CSS Sheets attached to element
            // which can contain CSS rule matching to this type.
            if (cssSheets.length) {
              // Get list of links.
              for (i = 0; item = cssSheets[i++];) {
                // Get dom <style> element.
                item = this.w.get('CssLink', item);
                // Search for declared CSS rules.
                if (com.cssRulesClassSearch(item.sheet, com.typeGlobal)) {
                  // If one rule exists, we need to add "typeGlobal" class name.
                  classLoads.typeGlobal = true;
                }
              }
            }
            // Global class name needed.
            if (classLoads.typeGlobal) {
              com.dom.classList.add(com.typeGlobal);
            }
            var fadeInComplete = function () {
              // Fade in is complete.
              com.domClassLoadRemove('fadeIn');
              // Mark as loaded with a css class.
              com.domClassLoadAdd('loaded');
              // Value is a callback.
              if (value) {
                value.call(com);
              }
            };
            // Launch fade in if not false and more than 0.
            if (classLoads.fadeIn) {
              com.domClassLoadAdd('fadeIn', fadeInComplete);
            }
            else {
              // Execute asynchronously.
              this.w.async(fadeInComplete);
            }
          }
        }
      },

      cssFadeOut: {
        defaults: false,
        define: function (com, value) {
          com.optionsData.cssFadeOut = value;
        },
        /**
         * @require JsMethod > webComExit
         */
        fadeOut: function (com) {
          // Async dom actions.
          if (com.dom) {
            // Add fade out class
            com.domClassLoadAdd('fadeOutChildren');
            var self = this, fadeOutCallback = function () {
              // Do not remove fadeOut class to avoid changes.
              // Execute fadeout callback.
              if (com.optionsData.cssFadeOut) {
                com.optionsData.cssFadeOut();
              }
              // Execute complete destroy.
              com.__destructFadeOutOptionComplete();
            };
            // Search for <div data-wjsInclude="..."> tags.
            self.w.wjsIncludeExit(com.domIncludes, function () {
              self.w.webComExit(com.requiredInstances, function () {
                // Launch fadeOut.
                if (typeof com.classLoads.fadeOut === 'number') {
                  com.__destructOptionsWaiting = true;
                  com.domClassLoadAdd('fadeOut', fadeOutCallback);
                }
                else {
                  fadeOutCallback();
                }
              });
            });
          } else {
            // Execute complete destroy.
            com.__destructFadeOutOptionComplete();
          }
        }
      }
    },

    /**
     * Contain default values for "options".
     * Used as shortcut by extended class to
     * fill values of options.optionName.defaults.
     */
    optionsDefault: {},

    /**
     * List of prototypes names to import data from.
     */
    mixin: [],

    /**
     * This is the root __construct function.
     * @require JsMethod > isPlainObject
     * @require JsMethod > inheritLinage
     * @require JsMethod > inheritObject
     * @require JsMethod > wjsIncludeInit
     * @require JsMethod > inheritProperty
     */
    __construct: function (options) {
      var w = this.w, i = 0,
        keys, key, optionsNames = [],
        optionsDefault = {},
        option;
      // Create a local copy.
      w.extendObject(optionsDefault, this.optionsDefault);
      // Add user options.
      w.extendObject(optionsDefault, options || {});
      // Init variables after mixin which have added some news.
      var variables = this.variables;
      // Flush variables to create a local copy.
      this.variables = {};
      // Init variables.
      this.variableInitMultiple(variables);
      // Create a unique ID, useful when instances are listed.
      this.readonly('id', 'w' + w.loaders.WebCom.webCompCounter);
      // Save reference.
      this.loader.instances[this.id] = this;
      // Append it.
      this.loader.instanceRegister(this);
      // Apply options defined with autoInit not to false.
      keys = Object.keys(this.options);
      while (key = keys[i++]) {
        option = this.options[key];
        if (option.autoInit) {
          optionsNames.push(key);
        }
        // Check for required missing options.
        if (option.required &&
          // Not defined by user.
          optionsDefault[key] === undefined &&
          // No default value.
          option.defaults === undefined) {
          // Fatal error.
          this.error('Missing option "' + key + '" and no defaults value');
        }
      }
      // Ask to add extra default options
      keys = Object.keys(optionsDefault);
      for (i = 0; key = keys[i++];) {
        if (!this.options[key]) {
          optionsNames.push(key);
        }
      }
      // Apply.
      this.optionApplyMultiple(optionsNames, optionsDefault);
      // Apply html at end, it allows
      // to use all defined variables into
      // parsed html templates.
      this.optionApply('html', optionsDefault);
      this.webComConstruct = true;
      // Send modified options to sub instance.
      return optionsDefault;
    },

    /**
     * Executed on destroying object.
     * @require JsMethod > isPlainObject
     */
    __destructFadeOutCount: 1,
    __destructComplete: false,
    __destruct: function (complete) {
      var i = 0, keys = Object.keys(this.options), key;
      this.__destructComplete = complete;
      while (key = keys[i++]) {
        if (this.options[key].fadeOut) {
          this.__destructFadeOutCount++;
          this.options[key].fadeOut(this);
        }
      }
      this.__destructFadeOutOptionComplete();
    },

    __destructFadeOutOptionComplete: function () {
      if (--this.__destructFadeOutCount === 0) {
        this.__destructFadeOutComplete();
      }
    },

    __destructFadeOutComplete: function () {
      var i = 0, keys = Object.keys(this.options), option;
      // Destroy all options.
      while (option = this.options[keys[i++]]) {
        // The fadeOutComplete arg is basically for the dom class.
        this.optionDestroy(option);
      }
      // Destroy all internal options.
      for (i = 0; option = this.optionsInternal[keys[i++]];) {
        // The fadeOutComplete arg is basically for the dom class.
        this.optionDestroy(option);
        this.loader.optionDestroy(option);
      }
      var self = this;
      // Ensure to execute callback async,
      // this keep code consistency.
      this.w.async(function () {
        // Protect against further modifications.
        // Remove loader reference.
        delete self.w.loaders.WebCom.webComList[self.id];
        // Remove instance from loader.
        self.loader.instanceRemove(self);
        // Remove variables created by call_base function,
        // it prevent object to be modified after this code,
        // it must stay the last script executed for this object.
        delete self._inheritMethodBases;
        delete self._inheritMethodPass;
        // No further modification allowed.
        Object.seal(self);
        if (self.__destructComplete) {
          self.__destructComplete();
        }
      });
    },

    /**
     * Call super method of current object.
     * Lighten implementation than JsMethod > inheritMethod,
     * but do not support complex super imbrication.
     */
    __super: function (method, args) {
      // Backup current context.
      var output, superBackup = this.__superProtos[method], base = superBackup || this, superProto = base;
      do {
        // Get parent prototype.
        if (!(superProto = Object.getPrototypeOf(superProto))) {
          // Reached last parent.
          return;
        }
      }
        // Prototype must be owner of a method with this name,
        // but not the same method from the current caller.
      while (!Object.getOwnPropertyDescriptor(superProto, method) || superProto[method] === base[method]);
      // Change global super context.
      this.__superProtos[method] = superProto;
      // Execute.
      output = this.__superProtos[method][method].apply(this, args);
      // Reset context, or set undefined.
      this.__superProtos[method] = superBackup;
      // Return content.
      return output;
    },

    exit: function (callback) {
      this.__destruct(callback);
    },

    /**
     * Save enabled keywords classes detected into a StyleSheet.
     * Main class name must be specified.
     * List of keys class names are stored into this.classLoads
     * TODO Do that into loader on prototype creation (with option)
     * @require JsMethod > cssSheetRules
     */
    cssRulesClassSearch: function (sheet, mainClassName) {
      var rules, i, j, hasRule = false, className, classRule,
        classRuleIE, cssRule, classLoads = this.classLoads, classRuleFound, duration;
      rules = this.w.cssSheetRules(sheet);
      for (i = 0; cssRule = rules[i++];) {
        // Selector can be missing into animation sections.
        if (cssRule.selectorText) {
          for (j = 0; className = this.classLoadsNames[j++];) {
            classRuleFound = false;
            classRule = '.' + mainClassName + '.' + className;
            // Internet explorer invert class selectors.
            classRuleIE = '.' + className + '.' + mainClassName;
            // Search
            if (cssRule.selectorText.indexOf(classRule) !== -1) {
              classRuleFound = classRule;
            }
            // Search for IE
            else if (cssRule.selectorText.indexOf(classRuleIE) !== -1) {
              classRuleFound = classRuleIE;
            }
            // We test both ie and other.
            // Check as true if not defined, false allow to disable.
            if (classRuleFound && classLoads[className] !== false) {
              // Save animation duration as value.
              classLoads[className] = classLoads[className] || 0;
              // Need typeGlobal class.
              hasRule = true;
              var regIsDirect = new RegExp('[\\s\\S]*' + classRuleFound.split('.').join('\\.') + '[^.]*$');
              duration = this.cssRuleDuration(cssRule);
              // Add CSS animation duration if defined.
              if (regIsDirect.test(cssRule.selectorText)) {
                classLoads[className] = duration;
              }
              // Use the longer animation of any children.
              else if (duration > classLoads[className]) {
                classLoads[className] = duration;
              }
            }
          }
        }
      }
      return hasRule;
    },

    cssRuleDuration: function (cssRule) {
      var output = 0, value;
      // Duration.
      output += (value = this.cssRuleNumberValue(cssRule, 'animationDuration')) ? value : 0;
      // Delay.
      output += (value = this.cssRuleNumberValue(cssRule, 'animationDelay')) ? value : 0;
      // Yeah.
      return output;
    },

    /**
     * @require JsMethod > cssVendorPrefix
     */
    cssRuleNumberValue: function (cssRule, name) {
      var time;
      name = this.w.cssVendorPrefix(name);
      if (cssRule.style[name]) {
        // Treat string numeric value.
        time = parseFloat(cssRule.style[name].replace(',', '.'));
        return (!isNaN(time)) ? time : 0;
      }
      return false;
    },

    method: function (path) {
      return this[this.methodName(path)];
    },

    methodName: function (path) {
      return '__' + path.split('.').join('__');
    },

    domChildAdd: function (name, tagName, content) {
      var domChild;
      if (!this.domChildren[name]) {
        if (typeof tagName === 'object') {
          domChild = tagName;
        }
        else {
          // Create.
          domChild = this.w.document.createElement(tagName || 'div');
        }
        // Add class
        domChild.classList.add(name);
        // Append only if orphan.
        if (!domChild.parentNode) {
          // Append.
          this.dom.appendChild(domChild);
        }
        // Save.
        this.domChildren[name] = domChild;
      }
      // Fill will also parse content.
      this.domChildFill(name, content);
      // Return node.
      return this.domChildGet(name);
    },

    domChildGet: function (name) {
      return this.domChildren[name];
    },

    /**
     * @require JsMethod > wjsHrefInit
     */
    domChildFill: function (name, content) {
      var dom = this.domChildGet(name), result;
      // Content can be already defined.
      if (content) {
        while (result = regHtmlVariable.exec(content)) {
          content = content.substring(0, result.index) + this[result[1]] + content.substring(result.index + result[0].length);
        }
        dom.innerHTML = content;
      }
      // Parse all node to search for w links.
      this.w.wjsHrefInit(dom);
      // Parse dom.
      this.domParseInclude();
    },

    domParseInclude: function (options) {
      options = options || {};
      // Define destination (no parent allowed for simple web com)
      options.domDestination = options.domDestination || this.dom;
      // Search for <div data-wjsInclude="..."> tags.
      this.domIncludes = this.domIncludes.concat(this.w.wjsIncludeInit(this.dom, options));
    },

    /**
     * Add a class if allowed, it can be
     * defined by constructor or automatically detected
     * when defined into stylesheet.
     * @require JsMethod > cssAnimateCallback
     */
    domClassLoadAdd: function (className, animationCallback) {
      // Class type must be declared, or detected into css sheet.
      if (typeof this.classLoads[className] === 'number') {
        // Add a listener if complete callback specified.
        if (animationCallback) {
          this.w.cssAnimateCallback(this.dom, animationCallback, this.classLoads[className] * 1000);
        }
        // Adding class will launch animation.
        this.dom.classList.add(className);
      }
    },

    /**
     * @require JsMethod > cssAnimateStop
     */
    domClassLoadRemove: function (className) {
      var domHtml = this.domChildGet('html');
      // Simply remove class.
      this.dom.classList.remove(className);
      // Dom may be disabled.
      if (domHtml) {
        // Shutdown all animation into html (not into children).
        this.w.cssAnimateStop(domHtml);
      }
    },

    /**
     * Create setter / getter for variable.
     * @require JsMethod > extend
     * @require JsMethod > isPlainObject
     */
    variableInit: function (name, value) {
      Object.defineProperty(this, name, {
        set: function (value) {
          return this.__variableSet(name, value);
        },
        get: function () {
          return this.__variableGet(name);
        },
        enumerable: true,
        configurable: true
      });
      var isArray = Array.isArray(value);
      if (this.w.isPlainObject(value) || isArray) {
        value = this.w.extend(isArray ? [] : {}, value);
      }
      this.variableSet(name, value);
    },

    readonly: function (name, value) {
      Object.defineProperty(this, name, {
        writable: false,
        value: value
      });
    },

    variableInitMultiple: function (variables) {
      // Get variables list.
      var i = 0, keys = Object.keys(variables), key;
      // Apply getters and setters.
      while (key = keys[i++]) {
        this.variableInit(key, variables[key]);
      }
    },

    __variableSet: function (name, value) {
      this.variables[name] = value;
    },

    /**
     * More explicit way to set variable.
     * This function helps to add complex interaction
     * when defining a variable, like parsing formulas
     * into element, without to have to execute it each time.
     * This method is used by options registering and
     * variable initialisation.
     */
    variableSet: function (name, value) {
      this[name] = value;
    },

    variableGet: function (name) {
      return this[name];
    },

    __variableGet: function (name) {
      return this.variables[name];
    },

    optionApplyMultiple: function (names, optionsList) {
      var i = 0, item;
      while (item = names[i++]) {
        this.optionApply(item, optionsList);
      }
    },

    /**
     * @require JsMethod > isPlainObject
     */
    optionApply: function (optionName, optionsList) {
      var option = this.options[optionName];
      // Create custom option object if missing.
      if (!option) {
        option =
          this.optionsInternal[optionName] =
            // Use custom prototype name.
            this.loader.optionCreate(this, 'BasicWebComOptionDefault#' + optionName + '#' + this.id, optionName, {
              // We specify value as default to avoid objects
              // to be considered as option prototypes, like into
              // base element option definitions.
              defaults: optionsList[optionName]
            });
      }
      option.optionApply(this, optionsList ? optionsList[optionName] : undefined, optionsList);
    },

    optionDestroy: function (option) {
      option.optionDestroy(this);
    },

    createInstances: function (request) {
      var self = this, instances = [];
      self.w.regEach(request, function (type, name) {
        instances.push(self.createInstance(type, name));
      });
      return instances;
    },

    createInstance: function (type, name, options) {
      options = options || {};
      // Define destination (no parent allowed for simple web com)
      options.domDestination = options.domDestination || this.dom;
      return this.w.loaders[type].instance(name, options);
    },

    destroyInstances: function (instances) {
      var self = this, i = 0, j = 0, item, type, length = instances.length,
        exitInstances = [];

// TODO
//      // Search for instance matching with request.
//      while (item = instances[i++]) {
//        type = item.loader.type;
//        if (request[type] && request[type].indexOf(item.type) !== -1) {
//          exitInstances.push(item);
//          delete instances[i++];
//        } T
//      }
      // Exit all instances.
      for (i = 0; item = instances[i++];) {
        item.exit(function () {
          if (++j === length) {
            // Launch destroy request.
            self.w.destroy(request);
          }
        });
      }
      return instances;
    },

    /**
     * @require JsMethod > inheritProperty
     */
    isA: function (type) {
      return (this.w.inheritProperty(this, 'type').indexOf(type) !== -1);
    },

    error: function (message) {
      throw new Error(message + ' in ' + this.typeGlobal + ' #' + this.id);
    }
  });
}(W));
