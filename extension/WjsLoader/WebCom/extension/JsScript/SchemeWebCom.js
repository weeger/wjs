(function (WjsProto) {
  'use strict';
  WjsProto.register('WebComScheme', 'SchemeWebCom', {
    classExtends: null,
    type: 'WebCom',
    id: '',

    variables: {
      optionsInternal: {},
      optionsApplied: {},
      optionsDestroyed: {},
      domChildren: {},
      classLoadsNames: ['fadeIn', 'loaded', 'fadeOut'],
      // Defines if javascript has to add
      // css classes in different status,
      // created
      classLoads: {typeGlobal: true},
      readyCallbacks: []
    },

    options: {
      require: {
        defaults: false,
        define: function (com, value) {
          if (value) {
            this.requiredWebCom = this.useInstances(value);
          }
        },
        destroy: function (com, value) {
          if (value) {
            this.destroyInstances(value, this.requiredWebCom);
          }
        }
      },
      urlAlias: {
        defaults: false
      },
      urlHistory: {
        defaults: false,
        unique: false,
        /**
         * @require JsMethod > urlQueryParse
         * @require JsMethod > urlQueryBuild
         * @require JsMethod > urlQueryUpdate
         */
        define: function (com, value) {
          if (value) {
            var wjs = this.wjs,
              state = '/' + wjs.settings.pathFull;
            if (!this.urlAlias) {
              com.optionApply('urlAlias');
              // Load used class.
              var loaderType = com.loader.type,
                params = wjs.urlQueryParse();
              params[loaderType] = params[loaderType] || {};
              if (this.unique && params[loaderType] !== com.type) {
                params[loaderType] = com.type;
              }
              // Avoid multiple insertion.
              else {
                params[loaderType][com.id] = com.type;
              }
              state += '?' + wjs.urlQueryBuild(params);
            }
            else if (com.urlAlias !== '[root]') {
              state += com.urlAlias;
            }
            // TODO : pushState for new page, replace for first loaded page.
            wjs.window.history.replaceState(null, null, state);
          }
        },
        /**
         * @require JsMethod > urlQueryParse
         * @require JsMethod > urlQueryBuild
         */
        destroy: function (com) {
          if (this.applied) { // TODO WHY ?
            var loaderType = com.loader.type, params = this.wjs.urlQueryParse();
            if (params[loaderType]) {
              if (this.unique) {
                delete params[loaderType];
              }
              // TODO Send replacement path for page nav (exit arguments + exit improvment).
              // wjs.window.history.replaceState(null, null, '?' + wjs.urlQueryBuild(params));
            }
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
         * @require JsMethod > cssAnimateCallback
         */
        define: function (com, value, options) {
          // If true, or not specified but html is present.
          value = (value === true || (typeof value !== 'object' && typeof options.html === 'string')) ? 'div' : value;
          if (value) {
            // Need CSS classes to exists.
            com.optionApply('cssClasses', options);
            com.optionApply('cssClassInteraction', options);
            com.optionApply('domImported', options);
            var i = 0, item, dom, backup = com.optionsData.dom = {}, wjs = this.wjs;
            backup.domCreated = !wjs.isDomNode(value);
            // Save reference.
            dom = backup.domCreated ? wjs.document.createElement(value) : value;
            // Backup attributes.
            backup.attributes = wjs.extendObject({}, wjs.domAttributes(dom));
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
              keys = objectKeys(com.wjs.domAttributes(com.dom))
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
            if (com.domImported || backup.domCreated) {
              // Destroy it.
              com.dom.parentNode.removeChild(com.dom);
            }
          }
        }
      },

      domImported: {
        // Define if dom is imported
        // so it have to be destroyed with object,
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
          if (com.dom && com.dom !== com.wjs.document.body) {
            value = value || com.wjs.document.body;
            if (typeof value === 'string') {
              value = com.wjs.document.querySelector(value);
            }
            value.appendChild(com.dom);
          }
        }
      },

      html: {
        defaults: false,
        define: function (com, value, options) {
          if (typeof value === 'string') {
            // Requires dom option.
            com.optionApply('dom', options);
            var dom = com.domChildAdd('html', 'div', value);
          }
        }
      },

      cssFadeIn: {
        defaults: false,
        define: function (com, value, options) {
          com.optionApply('dom', options);
          if (com.dom) {
            var classLoads = com.classLoads, hasTypeGlobal = classLoads.typeGlobal,
              hasCssKeyRule = com.cssRulesClassInit(),
              fadeInComplete = function () {
                com.domClassLoadAdd('loaded');
                if (value) {
                  value.call(com);
                }
              };
            // Use typeGlobal class if one of other type is used.
            hasTypeGlobal =
              classLoads.typeGlobal = hasTypeGlobal !== undefined ? hasTypeGlobal : hasCssKeyRule;
            if (hasTypeGlobal) {
              com.dom.classList.add(com.typeGlobal);
            }
            if (classLoads.fadeIn) {
              this.wjs.cssAnimateCallback(com.dom, 'fadeIn', fadeInComplete);
            }
            else {
              // Execute asynchronously.
              this.wjs.async(fadeInComplete);
            }
          }
        }
      },

      cssFadeOut: {
        defaults: false,
        define: function (com, value) {
          com.optionsData.cssFadeOut = value;
        },
        fadeOut: function (com) {
          // Async dom actions.
          if (com.dom) {
            // Add fade out class
            com.domClassLoadAdd('fadeOutChildren');
            var fadeOutCallback = function () {
              // Execute fadeout callback.
              if (com.optionsData.cssFadeOut) {
                com.optionsData.cssFadeOut();
              }
              // Execute complete destroy.
              com.__destructFadeOutOptionComplete();
            };
            // Search for <div data-wjsInclude="..."> tags.
            this.wjs.wjsIncludeExit(com.dom, function () {
              // Launch fadeOut.
              if (com.classLoads.fadeOut) {
                com.__destructOptionsWaiting = true;
                com.wjs.cssAnimateCallback(com.dom, 'fadeOut', function () {
                  fadeOutCallback();
                });
              }
              else {
                fadeOutCallback();
              }
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
     * Local object to store options data.
     */
    optionsData: {},

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
      var wjs = this.wjs, i = 0,
        keys, key, optionsNames = [],
        optionsDefault = {},
        option;
      // Create a local copy.
      wjs.extendObject(optionsDefault, this.optionsDefault);
      // Add user options.
      wjs.extendObject(optionsDefault, options || {});
      // Init variables after mixin which have added some news.
      var variables = this.variables;
      // Flush variables to create a local copy.
      this.variables = {};
      // Init variables.
      this.variableInitMultiple(variables);
      // Create a unique ID, useful when instances are listed.
      this.readonly('id', 'w' + wjs.loaders.WebCom.webCompCounter);
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
      // Send modified options to sub instance.
      return optionsDefault;
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

    cssRulesClassInit: function () {
      // Treat CSS fades.
      var hasCssKeyRule = false, i, item,
        extRequire = this.wjs.extRequire[this.loader.type],
        cssLinks = extRequire && extRequire[this.type] ? extRequire[this.type].CssLink : false;
      if (cssLinks) {
        // Get list of links
        for (i = 0; item = cssLinks[i++];) {
          item = this.wjs.get('CssLink', item);
          // Sheet should be checked as existing
          // by the CSSLink loader.
          if (this.cssRulesClassSearch(item.sheet, this.typeGlobal)) {
            hasCssKeyRule = true;
          }
        }
      }
      return hasCssKeyRule;
    },

    /**
     * Save enabled keywords classes detected into a StyleSheet.
     * Main class name must be specified.
     * List of kay class names are stored into this.classLoads
     * @require JsMethod > cssSheetRules
     */
    cssRulesClassSearch: function (sheet, mainClassName) {
      var rules, i, j, hasRule = false, className, classRule,
        classRuleIE, cssRule, classLoads = this.classLoads;
      rules = this.wjs.cssSheetRules(sheet);
      for (i = 0; cssRule = rules[i++];) {
        // Selector can be missing into animation sections.
        if (cssRule.selectorText) {
          for (j = 0; className = this.classLoadsNames[j++];) {
            classRule = '.' + mainClassName + '.' + className;
            // Internet explorer invert class selectors.
            classRuleIE = '.' + className + '.' + mainClassName;
            // We test both ie and other.
            if (cssRule.selectorText.indexOf(classRule) !== -1 ||
              cssRule.selectorText.indexOf(classRuleIE) !== -1) {
              // Check as true if not defined
              classLoads[className] =
                classLoads[className] !== undefined ?
                  classLoads[className] : true;
              // Need typeGlobal class.
              hasRule = true;
            }
          }
        }
      }
      return hasRule;
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
      this.wjs.async(function () {
        // Protect against further modifications.
        // Remove loader reference.
        delete self.wjs.loaders.WebCom.webComList[self.id];
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
          domChild = this.wjs.document.createElement(tagName || 'div');
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
      var dom = this.domChildGet(name);
      // Content can be already defined.
      if (content) {
        dom.innerHTML = content;
      }
      // Parse all node to search for wjs links.
      this.wjs.wjsHrefInit(dom);
      // Search for <div data-wjsInclude="..."> tags.
      this.wjs.wjsIncludeInit(this.dom);
    },

    /**
     * Add a class if allowed, it can be
     * defined by constructor or automatically detected
     * when defined into stylesheet.
     * @param className
     */
    domClassLoadAdd: function (className) {
      if (this.classLoads[className]) {
        this.dom.classList.add(className);
      }
    },

    domClassLoadRemove: function (className) {
      if (this.classLoads[className]) {
        this.dom.classList.remove(className);
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
      if (this.wjs.isPlainObject(value) || isArray) {
        value = this.wjs.extend(isArray ? [] : {}, value);
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

    useInstances: function (request) {
      var self = this, instances = [];
      self.wjs.use(request, function () {
        // Create instance for WebCom
        if (request.WebCom) {
          var i = 0, item;
          while (item = request.WebCom[i++]) {
            instances.push(self.wjs.loaders.WebCom.instance(item));
          }
        }
      });
      return instances;
    },

    destroyInstances: function (request, instances) {
      var self = this, i = 0, j = 0, item, type,
        exitInstances = [];
      // Search for instance matching with request.
      while (item = instances[i++]) {
        type = item.loader.type;
        if (request[type] && request[type].indexOf(item.type) !== -1) {
          exitInstances.push(item);
          delete instances[i++];
        }
      }
      // Exit all instances.
      for (i = 0; item = exitInstances[i++];) {
        item.exit(function () {
          if (++j === exitInstances.length) {
            // Launch destroy request.
            self.wjs.destroy(request);
          }
        });
      }
      return instances;
    },

    /**
     * @require JsMethod > inheritProperty
     */
    isA: function (type) {
      return (this.wjs.inheritProperty(this, 'type').indexOf(type) !== -1);
    },

    error: function (message) {
      throw new Error(message + ' in ' + this.typeGlobal + ' #' + this.id);
    }
  });
}(WjsProto));
