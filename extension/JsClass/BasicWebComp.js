/**
 * Base class for WebComp elements.
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('JsClass', 'BasicWebComp', {
    type: 'WebComp',

    variables: {
      id: null,
      typeGlobal: '',
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
      urlHistory: {
        defaults: false,
        unique: false,
        /**
         * @require JsMethod > urlQueryParse
         * @require JsMethod > urlQueryBuild
         */
        define: function (value) {
          if (value) {
            // Load used class.
            var loaderType = this.loader.type, params = wjs.urlQueryParse();
            params[loaderType] = params[loaderType] || [];
            if (this.options.urlHistory.unique) {
              params[loaderType] = this.type;
            }
            // Avoid multiple insertion.
            else if (params[loaderType].indexOf(this.type) === -1) {
              params[loaderType].push(this.type);
            }
            wjs.window.history.replaceState(null, null, '?' + wjs.urlQueryBuild(params));
          }
        },
        destroy: function () {
          if (this.options.urlHistory.applied) {
            var loaderType = this.loader.type, params = this.wjs.urlQueryParse();
            if (params[loaderType]) {
              if (this.options.urlHistory.unique) {
                delete params[loaderType];
              }
              wjs.window.history.replaceState(null, null, '?' + wjs.urlQueryBuild(params));
            }
          }
        }
      },

      includeDestroyQueued: {
        defaults: false
      },

      dom: {
        defaults: false,
        backup: {
          domCreated: null,
          className: '',
          attributes: {}
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
            var i = 0, j, k, dom, item,
              backup = this.options.dom.backup,
              className, classRule, classRuleIE,
              cssNeedTypeGlobalClass = false, cssRule, extRequire = this.wjs.extRequire[this.loader.type],
              cssLinks = extRequire && extRequire[this.type] ? extRequire[this.type].CssLink : false,
              cssClassLoads = this.classLoads;
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
              for (i; i < this.cssClasses.length; i++) {
                dom.classList.add(this.cssClasses[i]);
              }
            }
            // Appending element to a dom parent is managed externally,
            // for element, see parent option of elements constructor.
            this.dom = dom;
            // Search for special css classes.
            if (cssLinks) {
              // Get list of links
              for (i = 0; item = cssLinks[i++];) {
                item = this.wjs.get('CssLink', item);
                for (j = 0; cssRule = item.sheet.rules[j++];) {
                  // Selector can be missing into animation sections.
                  if (cssRule.selectorText) {
                    for (k = 0; className = this.classLoadsNames[k++];) {
                      classRule = '.' + this.typeGlobal + '.' + className;
                      // Internet explorer invert class selectors.
                      classRuleIE = '.' + className + '.' + this.typeGlobal;
                      // We test both ie and other.
                      if (cssRule.selectorText.indexOf(className) !== -1 ||
                        cssRule.selectorText.indexOf(classRuleIE) !== -1) {
                        // Check as true if not defined
                        cssClassLoads[className] =
                          cssClassLoads[className] !== undefined ?
                            cssClassLoads[className] : true;
                        // Need typeGlobal class.
                        cssNeedTypeGlobalClass = true;
                      }
                    }
                  }
                }
              }
            }
            // Use typeGlobal class if one of other type is used.
            cssClassLoads.typeGlobal = cssClassLoads.typeGlobal !== undefined ? cssClassLoads.typeGlobal : cssNeedTypeGlobalClass;
            if (cssClassLoads.typeGlobal) {
              dom.classList.add(this.typeGlobal);
            }
            // Add
            this.domClassLoadAdd(this.typeGlobal);
            if (cssClassLoads.fadeIn) {
              this.wjs.cssAnimateCallback(dom, 'fadeIn', this.options.dom.cssFadeInComplete);
            }
            else {
              this.options.dom.cssFadeInComplete();
            }
          }
        },

        cssFadeInComplete: function () {
          this.domClassLoadAdd('loaded');
        },

        /**
         * @require JsMethod > wjsIncludeExit
         */
        destroy: function (value, fadeOutComplete) {
          if (this.dom) {
            var self = this, cssClassLoads = self.classLoads;
            // Add fade out class
            this.domClassLoadAdd('fadeOutChildren');
            // Search for <wjs-include> tags.
            wjs.wjsIncludeExit(self.dom, function () {
              // Launch fadeOut.
              if (cssClassLoads.fadeOut) {
                self.wjs.cssAnimateCallback(self.dom, 'fadeOut', function () {
                  self.options.dom.cssFadeOutComplete(fadeOutComplete);
                });
              }
              else {
                self.options.dom.cssFadeOutComplete(fadeOutComplete);
              }
            }, this.includeDestroyQueued);
          }
        },

        cssFadeOutComplete: function (fadeOutComplete) {
          var i = 0, backup = this.options.dom.backup, ObjectKeys = Object.keys,
          // Get list of all attributes to inspect,
          // from current sets,
            keys = ObjectKeys(this.wjs.domAttributes(this.dom))
              // And from saved one.
              .concat(ObjectKeys(backup.attributes));
          // Iterates over all attributes.
          for (; i < keys.length; i++) {
            if (backup.attributes[keys[i]]) {
              this.dom.setAttribute(keys[i], backup.attributes[keys[i]]);
            }
            else {
              this.dom.removeAttribute(keys[i]);
            }
          }
          // If dom has been created on define.
          if (this.options.dom.backup.domCreated) {
            // Destroy it.
            this.dom.parentNode.removeChild(this.dom);
          }
          if (fadeOutComplete) {
            fadeOutComplete();
          }
        }
      },

      domDestination: {
        defaults: null,
        /**
         * @require JsMethod > isDomNode
         */
        define: function (value) {
          value = value || this.wjs.document.body;
          if (typeof value === 'string') {
            value = this.wjs.document.querySelector(value);
          }
          value.appendChild(this.dom);
        }
      },

      html: {
        defaults: false,
        define: function (value, options) {
          if (typeof value === 'string') {
            // Requires dom option.
            this.optionApply('dom', options);
            var dom = this.domChildAdd('html', 'div');
            this.domChildFill('html', value);
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
     * This is the root __construct function.
     * @require JsMethod > isPlainObject
     * @require JsMethod > inheritLinage
     * @require JsMethod > inheritObject
     * @require JsMethod > wjsIncludeInit
     */
    __construct: function (options) {
      var wjs = this.wjs, i = 0, variables, mixin, item,
      // Create a final object combining default data.
        keys, optionsInit = [], optionsDefault = {},
        selfOptions, option, optionIsObject, loaderCreator = wjs.loaders.WebComp;
      // Merge prototype settings with parent lineage.
      wjs.inheritLinage(this, 'optionsDefault');
      // Merge properties to object (xxx.properties.zzz is accessed by xxx.zzz),
      // and fires getters and setters.
      variables = this.variables = wjs.inheritObject(this, 'variables');
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
      // Get variables list.
      keys = Object.keys(variables);
      // Apply getters and setters.
      for (i = 0; i < keys.length; i++) {
        this.variableInit(keys[i], variables[keys[i]]);
      }
      // Create type name, used to recognise objects types.
      this.typeGlobal = wjs.inheritProperty(this, 'type').join('-');
      // Create a unique ID, useful when instances are listed.
      if (this.id === null) {
        this.id = 'w' + loaderCreator.webCompCounter;
        // Increment counter to ensure unique IDs.
        // We need a global registry for all creator instances.
        loaderCreator.webCompCounter += 1;
      }
      loaderCreator.webCompList[this.id] = this;
      // Apply options defined with autoInit to true.
      selfOptions = this.options;
      keys = Object.keys(selfOptions);
      for (i = 0; i < keys.length; i++) {
        option = selfOptions[keys[i]];
        optionIsObject = this.wjs.isPlainObject(option);
        // Auto init by default.
        if (!optionIsObject || option.autoInit !== false) {
          optionsInit.push(keys[i]);
        }
        // Check for required missing options.
        if (optionIsObject && option.required &&
          // Not defined by user.
          optionsDefault[keys[i]] === undefined &&
          // No default value.
          option.defaults === undefined) {
          // Fatal error.
          this.error('Missing option "' + keys[i] + '" and no defaults value');
        }
      }
      this.optionApplyMultiple(optionsInit, optionsDefault);
      // User friendly function.
      this.init(options);
      // Send modified options to further application.
      return optionsDefault;
    },

    /**
     * Executed on destroying object.
     * @require JsMethod > isPlainObject
     */
    __destruct: function (fadeOutComplete) {
      var i = 0, keys = Object.keys(this.options), key, option;
      // Destroy all options.
      while (key = keys[i++]) {
        option = this.options[key];
        // Options can contain value in place of option parameters.
        if (this.wjs.isPlainObject(option) && option.destroy) {
          // The fadeOutComplete arg is basically for the dom class.
          option.destroy(option.applied, fadeOutComplete);
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
    },

    init: function (options) {
      // To override...
    },

    exit: function (fadeOutComplete) {
      this.__destruct(fadeOutComplete);
    },

    domChildAdd: function (name, tagName, content) {
      var domChild;
      if (!this.domChildren[name]) {
        // Create.
        domChild = this.wjs.document.createElement(tagName || 'div');
        // Add class
        domChild.classList.add(name);
        // Append.
        this.dom.appendChild(domChild);
        // Save.
        this.domChildren[name] = domChild;
      }
      if (content) {
        this.domChildFill(name, content);
      }
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
      dom.innerHTML = content;
      // Parse all node to search for wjs links.
      this.wjs.wjsHrefInit(dom);
      // Search for <wjs-include> tags.
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
     * @param name
     * @param value
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
      // Consider empty values like "" or null as real values.
      if (optionsList[optionName] !== undefined) {
        // Get value from user options.
        optionValue = optionsList[optionName];
      }
      else if (isObject) {
        // Get value from defaults value.
        optionValue = option.defaults;
      }
      else {
        // Value can be defined in place
        // of option data (for non objects).
        optionValue = option;
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
            // TODO When rolling back before exit, we have to disable destruction
            // Launch destroy request.
            self.wjs.destroy(request);
          }
        });
      }
      return instances;
    }
  });
}(WjsProto));
