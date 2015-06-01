/**
 * Base class for WebComp elements.
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('JsClass', 'BasicWebComp', {
    type: 'WebComp',
    typeGlobal: 'WebComp',

    variables: {
      id: null,
      optionsApplied: [],
      dom: null,
      domChildren: {},
      classLoadsNames: ['fadeIn', 'loaded', 'fadeOut'],
      // Defines if javascript has to add
      // css classes in different status,
      // created
      classLoads: {typeGlobal: true}
    },

    options: {
      require: {
        defaults: false,
        define: function (value) {
          if (value) {
            this.options.require.requiredWebComp = this.useInstances(value);
          }
        },
        destroy: function (value) {
          if (value) {
            this.destroyInstances(value, this.options.require.requiredWebComp);
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
         */
        define: function (value) {
          if (value) {
            var wjs = this.wjs,
              state = '/' + wjs.settings.pathFull;
            if (!this.urlAlias) {
              this.optionApply('urlAlias');
              // Load used class.
              var loaderType = this.loader.type,
                params = wjs.urlQueryParse();
              params[loaderType] = params[loaderType] || [];
              if (this.options.urlHistory.unique && params[loaderType] !== this.type) {
                params[loaderType] = this.type;
              }
              // Avoid multiple insertion.
              else if (params[loaderType].indexOf(this.type) === -1) {
                params[loaderType].push(this.type);
              }
              else {
                // Do not need to update history.
                return;
              }
              state += '?' + wjs.urlQueryBuild(params);
            }
            else if (this.urlAlias !== '[root]') {
              state += this.urlAlias;
            }
            // TODO : pushState for new page, replace for first loaded page.
            wjs.window.history.replaceState(null, null, state);
          }
        },
        /**
         * @require JsMethod > urlQueryParse
         * @require JsMethod > urlQueryBuild
         */
        destroy: function () {
          if (this.options.urlHistory.applied) {
            var loaderType = this.loader.type, params = this.wjs.urlQueryParse();
            if (params[loaderType]) {
              if (this.options.urlHistory.unique) {
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
        define: function (value) {
          if (!value) {
            return this.typeGlobal;
          }
          return value;
        }
      },

      dom: {
        defaults: false,
        backup: {
          domCreated: null,
          className: '',
          attributes: {}
        },
        cssClasses: {
          defaults: []
        },
        domImported: {
          // Define if dom is imported
          // so it have to be destroyed with object,
          // like if it was internally created.
          defaults: false
        },
        /**
         * @require JsMethod > isDomNode
         * @require JsMethod > domAttributes
         * @require JsMethod > cssAnimateCallback
         */
        define: function (value, options) {
          // If true, or not specified but html is present.
          value = (value === true || (typeof value !== 'object' && typeof options.html === 'string')) ? 'div' : value;
          if (value) {
            // Need CSS classes to exists.
            this.optionApply('cssClasses', options);
            this.optionApply('cssClassInteraction', options);
            this.optionApply('domImported', options);
            var i = 0, item, dom, backup = this.options.dom.backup;
            backup.domCreated = !this.wjs.isDomNode(value);
            // Save reference.
            dom = backup.domCreated ? this.wjs.document.createElement(value) : value;
            // Backup attributes.
            backup.attributes = this.wjs.extendObject({}, this.wjs.domAttributes(dom));
            // Id can be used for css selectors.
            dom.setAttribute('id', this.id);
            // Backup current class name.
            backup.className = dom.className;
            if (this.cssClasses) {
              while (item = this.cssClasses[i++]) {
                dom.classList.add(item);
              }
            }
            // Appending element to a dom parent is managed externally,
            // for element, see parent option of elements constructor.
            this.dom = dom;
          }
        },

        /**
         * @require JsMethod > wjsIncludeExit
         */
        destroy: function () {
          if (this.dom) {
            var item, i = 0, backup = this.options.dom.backup, objectKeys = Object.keys,
            // Get list of all attributes to inspect,
            // from current sets,
              keys = objectKeys(this.wjs.domAttributes(this.dom))
                // And from saved one.
                .concat(objectKeys(backup.attributes));
            // Iterates over all attributes.
            while (item = keys[i++]) {
              if (backup.attributes[item]) {
                this.dom.setAttribute(item, backup.attributes[item]);
              }
              else {
                this.dom.removeAttribute(item);
              }
            }
            // If dom has been created on define.
            if (this.domImported || this.options.dom.backup.domCreated) {
              // Destroy it.
              this.dom.parentNode.removeChild(this.dom);
            }
          }
        }
      },

      domDestination: {
        defaults: null,
        define: function (value, options) {
          // Requires html && dom option.
          this.optionApply('dom', options);
          if (!value && (!this.dom || this.dom.parentNode)) {
            return;
          }
          if (this.dom && this.dom !== this.wjs.document.body) {
            value = value || this.wjs.document.body;
            if (typeof value === 'string') {
              value = this.wjs.document.querySelector(value);
            }
            value.appendChild(this.dom);
          }
        }
      },

      html: {
        defaults: false,
        define: function (value, options) {
          if (typeof value === 'string') {
            // Requires dom option.
            this.optionApply('dom', options);
            var dom = this.domChildAdd('html', 'div', value);
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
      var wjs = this.wjs, i = 0, mixin, item,
      // Create a final object combining default data.
        keys, key, optionsInit = [], optionsDefault = {},
        option, optionIsObject, loaderWebComp = wjs.loaders.WebComp;
      // Merge variables to object (xxx.properties.zzz is accessed by xxx.zzz),
      // and fires getters and setters.
      this.variables = wjs.inheritObject(this, 'variables');
      // Merge prototype settings with parent lineage.
      wjs.inheritLinage(this, 'optionsDefault');
      // Get options.
      wjs.inheritLinage(this, 'options');
      wjs.inheritLinage(this, 'mixin');
      // Add mixin values on non defined data.
      while (item = this.mixin[i++]) {
        this.mixinProto(item);
      }
      // Add default values (inherited).
      wjs.extendObject(optionsDefault, this.optionsDefault);
      // Add user options.
      wjs.extendObject(optionsDefault, options || {});
      // Init variables after mixins.
      this.variableInitMultiple(this.variables);
      // Create a unique ID, useful when instances are listed.
      if (this.id === null) {
        this.id = 'w' + loaderWebComp.webCompCounter;
        // Increment counter to ensure unique IDs.
        // We need a global registry for all creator instances.
        loaderWebComp.webCompCounter += 1;
      }
      loaderWebComp.webCompList[this.id] = this;
      // Apply options defined with autoInit not to false.
      keys = Object.keys(this.options);
      for (i = 0; key = keys[i++];) {
        option = this.options[key];
        optionIsObject = this.wjs.isPlainObject(option);
        // Auto init by default.
        if (!optionIsObject || option.autoInit !== false) {
          optionsInit.push(key);
        }
        // Check for required missing options.
        if (optionIsObject && option.required &&
          // Not defined by user.
          optionsDefault[key] === undefined &&
          // No default value.
          option.defaults === undefined) {
          // Fatal error.
          this.error('Missing option "' + key + '" and no defaults value');
        }
      }
      // Ask to add extra user options
      optionsInit = optionsInit.concat(Object.keys(optionsDefault));
      // Apply.
      this.optionApplyMultiple(optionsInit, optionsDefault);
      // Async dom actions.
      if (this.dom) {
        var classLoads = this.classLoads, hasTypeGlobal = classLoads.typeGlobal,
          hasCssKeyRule = this.cssRulesClassInit(), self = this,
          fadeInComplete = function () {
            self.domClassLoadAdd('loaded');
          };
        // Use typeGlobal class if one of other type is used.
        hasTypeGlobal =
          classLoads.typeGlobal = hasTypeGlobal !== undefined ? hasTypeGlobal : hasCssKeyRule;
        if (hasTypeGlobal) {
          this.dom.classList.add(this.typeGlobal);
        }
        if (classLoads.fadeIn) {
          this.wjs.cssAnimateCallback(this.dom, 'fadeIn', fadeInComplete);
        }
        else {
          fadeInComplete();
        }
      }
      // Send modified options to further application.
      return optionsDefault;
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
    __destruct: function (complete) {
      // Async dom actions.
      if (this.dom) {
        var self = this, cssClassLoads = self.classLoads;
        // Add fade out class
        this.domClassLoadAdd('fadeOutChildren');
        // Search for <div data-wjsInclude="..."> tags.
        self.wjs.wjsIncludeExit(self.dom, function () {
          // Launch fadeOut.
          if (cssClassLoads.fadeOut) {
            self.wjs.cssAnimateCallback(self.dom, 'fadeOut', function () {
              self.__destructFadeComplete(complete);
            });
          }
          else {
            self.__destructFadeComplete(complete);
          }
        });
        return;
      }
      // Treat CSS Fades
      this.__destructFadeComplete(complete);
    },

    __destructFadeComplete: function (complete) {
      var i = 0, keys = Object.keys(this.options), key, option;
      // Destroy all options.
      while (key = keys[i++]) {
        option = this.options[key];
        // Options can contain value in place of option parameters.
        if (this.wjs.isPlainObject(option) && option.destroy) {
          // The fadeOutComplete arg is basically for the dom class.
          option.destroy(option.applied);
        }
      }
      // Protect against further modifications.
      // Remove loader reference.
      delete this.wjs.loaders.WebComp.webCompList[this.id];
      this.loader.instanceDestroy(this);
      // Remove variables created by call_base function,
      // it prevent object to be modified after this code,
      // it must stay the last script executed for this object.
      delete this._inheritMethodBases;
      delete this._inheritMethodPass;
      // No further modification allowed.
      Object.seal(this);
      if (complete) {
        complete();
      }
    },

    exit: function (fadeOutComplete) {
      this.__destruct(fadeOutComplete);
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
        set: this.variableSetter(name),
        get: this.variableGetter(name),
        enumerable: true,
        configurable: true
      });
      this[name] = value;
    },

    variableInitMultiple: function (variables) {
      // Get variables list.
      var i = 0, keys = Object.keys(variables), key;
      // Apply getters and setters.
      while (key = keys[i++]) {
        this.variableInit(key, variables[key]);
      }
    },

    /**
     * Generates a callback for variable setter.
     * @param name
     * @returns {Function}
     */
    variableSetter: function (name) {
      return function (value) {
        this.variableSetWrapper(name, value);
      };
    },

    /**
     * Generates a callback for variable getter.
     * @param name
     * @returns {Function}
     */
    variableGetter: function (name) {
      return function () {
        return this.variableGetWrapper(name);
      };
    },

    variableSetWrapper: function (name, value) {
      this.variables[name] = value;
    },

    variableGetWrapper: function (name) {
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
      var option = this.options[optionName],
        isObject = this.wjs.isPlainObject(option),
        optionValue;
      // Apply each option only once.
      if (this.optionsApplied.indexOf(optionName) !== -1) {
        return;
      }
      this.optionsApplied.push(optionName);
      // Value can be defined in place
      // of option data (for non objects).
      if (!isObject) {
        // Get value from defaults value.
        option = {defaults: option};
      }
      // Consider empty values like "" or null as real values.
      if (optionsList[optionName] !== undefined) {
        // Get value from user options.
        optionValue = optionsList[optionName];
      }
      else {
        // Get value from defaults value.
        optionValue = option.defaults;
      }
      // Save applied value, before returned.
      option.applied = optionValue;
      // Execute option setter after default value definition.
      if (isObject && option.define) {
        optionValue = option.define.apply(this, [optionValue, optionsList]);
      }
      // Set value as object variable.
      if (optionValue !== undefined) {
        // Each option defines a standard variable.
        this.variableInit(optionName, optionValue);
      }
    },

    useInstances: function (request) {
      var self = this, instances = [];
      self.wjs.use(request, function () {
        // Create instance for WebComp
        if (request.WebComp) {
          var i = 0, item;
          while (item = request.WebComp[i++]) {
            instances.push(self.wjs.loaders.WebComp.instance(item));
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
     * Merge descriptions from constructor.
     */
    mixinProto: function (name) {
      // Method must be loaded.
      var methods = this.wjs.classMethods[name];
      this.mixinProtoItem(methods, 'variables');
      this.mixinProtoItem(methods, 'options');
      this.mixinProtoItem(methods, 'optionsDefault');
    },

    /**
     * @require JsMethod > objectFill
     */
    mixinProtoItem: function (methods, name) {
      // variable name can not exists int method,
      // some variables are created by
      // inheritance on object instantiation.
      if (methods[name]) {
        if (!this[name]) {
          // Create object if not defined.
          this[name] = Array.isArray(methods[name]) ? [] : {};
        }
        this.wjs.objectFill(this[name], methods[name], true);
      }
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
