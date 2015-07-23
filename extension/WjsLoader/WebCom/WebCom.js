/**
 * Loads javascript factory constructor.
 * Explicitly loads JsClass loader to reduce requests.
 * @require WjsLoader > JsClass
 * @require WjsLoader > CssLink
 * @require JsScript > SchemeWebCom
 * @require JsClass > BasicWebComOption
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('WjsLoader', 'WebCom', {
    protoBaseClass: 'WebCom',

    /**
     * @require JsMethod > urlQueryReplace
     */
    __construct: function () {
      this.wjs.extendObject(this, {
        webCompCounter: 0,
        webCompSchemes: {},
        wjsShortcuts: false,
        instances: {},
        instancesCount: {},
        optionsProtos: {},
        webComList: {}
      });
      // Proxy methods.
      this.protoAddPartProxy = this.protoAddPart.bind(this);
      // Create base prototype.
      this.protoAdd(this.protoBaseClass, WjsProto.retrieve('WebComScheme', 'Scheme' + this.protoBaseClass));
      if (!this.wjs.domStyleAnim) {
        // Create global CSS void animation,
        // used to manage fades without visible changes.
        this.wjs.domStyleAnim = this.wjs.document.createElement('style');
        // Append keyframe animation,
        // IE can't animate an undefined property or a void animation
        // but it support transition to the same value.
        this.wjs.domStyleAnim.innerHTML = '@keyframes wjsAnimVoid { from { opacity:inherit; } to { opacity:inherit; } }';
        // Add to head.
        this.wjs.document.head.appendChild(this.wjs.domStyleAnim);
      }
      // Use base construction.
      WjsProto.lib.Loader.__construct.call(this);
      // Load instances asked from URL
      var params = this.wjs.urlQueryParse();
      // Some query are into URL
      if (params[this.type]) {
        var self = this, items = params[this.type], i = 0, key,
          request = {}, type = this.type;
        // Build request base.
        request[type] = [];
        // Item is an array, it contain multiple webcom,
        if (typeof items !== 'string') {
          var keys = Object.keys(items);
          while (key = keys[i++]) {
            request[type].push(items[key]);
          }
        }
        // If not web com may be unique like web page.
        else {
          request[type].push(items);
        }
        // Flush URL.
        delete params[type];
        this.wjs.urlQueryReplace(params);
        // Launch use.
        this.wjs.use(request, function () {
          var i = 0;
          while (key = request[type][i++]) {
            // Create one instance of each requested item.
            self.instance(key);
          }
        });
      }
    },

    __destruct: function () {
      // Remove global keyframe animation.
      this.wjs.document.head.removeChild(this.domStyleAnim);
      // Use base destruction.
      WjsProto.lib.Loader.__destruct.call(this);
    },

    parse: function (name, value, process) {
      // If a js file is attached, it have been already
      // loaded, and registered items are waiting to be parsed.
      this.protoAdd(name, WjsProto.retrieve(this.type, name) || {});
      // Enable.
      WjsProto.lib.Loader.parse.apply(this, arguments);
      return value;
    },

    protoName: function (name) {
      // If no objectType type defined, object is from base class.
      // using this.protoBaseClass instead "factory" allow to subclass of loader
      // to create own instances objects.
      return this.protoBaseClass + (name && name !== this.protoBaseClass ? '\\' + name : '');
    },

    /**
     * @require JsMethod > classProtoLineage
     * @require JsMethod > inheritObject
     * @require JsMethod > upperCaseFirstLetter
     */
    protoAdd: function (name, scheme) {
      this.bundleEach(name, scheme, this.protoAddPartProxy);
    },

    protoAddPart: function (name, scheme) {
      var protoName = this.protoName(name),
      // Start new proto from scratch.
        proto = {
          type: name,
          loader: this,
          classExtends: scheme.classExtends !== null ? (scheme.classExtends || this.protoBaseClass) : false,
          __superProtos: {}
        };
      // Define default scheme data.
      scheme = this.wjs.extendObject({
        variables: {},
        options: {},
        optionsDefault: {}
      }, scheme, true);
      // Scheme
      this.webCompSchemes[protoName] = scheme;
      // Create com proto
      this.wjs.classExtend(protoName, proto);
      // Build prototype;
      proto = this.wjs.classProto(protoName).prototype;
      // Type global.
      proto.typeGlobal = this.wjs.classProtoLineage(protoName).join('-');
      // Now edit the prototype with inherited variables.
      var keys = Object.keys(scheme), item, i = 0, method;
      while (item = keys[i++]) {
        // Create method name.
        method = 'protoParse' + this.wjs.upperCaseFirstLetter(item);
        // Use default if undefined.
        method = this[method] ? method : 'protoParseDefault';
        // Parse.
        this[method](proto, scheme, item);
      }
    },

    bundleEach: function (name, scheme, callback) {
      callback(name, scheme);
      // Create sub packages.
      if (scheme.bundle) {
        for (var keys = Object.keys(scheme.bundle), key, i = 0; key = keys[i++];) {
          this.bundleEach(
            // Give a bundler name.
            name + '.' + key,
            // Give part of data.
            scheme.bundle[key],
            callback);
        }
      }
    },

    optionCreate: function (proto, protoName, name, optionProto) {
      var protoParent = Object.getPrototypeOf(proto);
      // Allow non object values.
      if (typeof optionProto !== 'object') {
        optionProto = {defaults: optionProto};
      }
      optionProto.name = name;
      // Save proto name.
      optionProto.protoName = protoName;
      // Add inheritance management.
      optionProto.classExtends = protoParent.options && protoParent.options[name] ? protoParent.options[name].className : 'BasicWebComOption';
      // Auto init is true by default.
      this.optionCreateSetting(optionProto, protoParent, 'autoInit', true);
      // Not required by default.
      this.optionCreateSetting(optionProto, protoParent, 'required', false);
      // Build prototype.
      this.wjs.classExtend(optionProto.protoName, optionProto);
      // Return object.
      return new (this.wjs.classProto(optionProto.protoName))(name);
    },

    /**
     * Options settings set into schemes can
     * inherit property from parent scheme or
     * be overridden like other properties.
     */
    optionCreateSetting: function (optionProto, protoParent, settingName, defaults) {
      // First value has priority.
      if (optionProto[settingName] === undefined) {
        // Search into parent prototype options if a value exists.
        optionProto[settingName] = (
          // Options should exist
          protoParent.options &&
            // Same entry.
            protoParent.options[name] &&
            // Value must not be undefined.
            protoParent.options[name][settingName] !== undefined) ?
          // True byn default.
          protoParent.options[name][settingName] : defaults;
      }
    },

    optionDestroy: function (option) {
      this.wjs.classProtoDestroy(option.protoName);
    },

    /**
     * @require JsMethod > isPlainObject
     */
    methodsFlatten: function (proto, part, name, depth, level, prefix) {
      var separator = '__', keys = Object.keys(part[name]), group, i = 0;
      prefix = prefix || separator + name;
      depth = depth || 1;
      level = level || 0;
      while (group = keys[i++]) {
        var propertyName = prefix + separator + group;
        if (level + 1 < depth && this.wjs.isPlainObject(part[name][group])) {
          this.methodsFlatten(proto, part[name], group, depth, level + 1, propertyName);
        }
        else {
          proto[propertyName] = part[name][group];
        }
      }
    },

    inheritObject: function (proto, scheme, item) {
      // Variable are unique for each instance.
      var protoParent = Object.getPrototypeOf(proto),
        base = protoParent[item] ? this.wjs.extend(true, {}, protoParent[item]) : {};
      // Inherit variables from direct parent.
      proto[item] = this.wjs.extend(true, base, scheme[item]);
    },

    protoParseDefault: function (proto, scheme, item) {
      // Simply copy
      if (typeof scheme[item] !== 'object' || scheme[item] === null) {
        proto[item] = scheme[item];
      }
      // Clone objects
      else {
        proto[item] = this.wjs.extend(Array.isArray(scheme[item]) ? [] : {}, scheme[item]);
      }
    },

    protoParseVariables: function (proto, scheme, item) {
      // Create a unique object, inherit parent properties.
      this.inheritObject(proto, scheme, item);
    },

    protoParseOptions: function (proto, scheme) {
      var key, i = 0, keys;
      proto.options = {};
      // Scheme adds options.
      if (scheme.options) {
        // Create a new option instance for each comp type
        // shared by all comp instances.
        for (keys = Object.keys(scheme.options); key = keys[i++];) {
          // Create a custom name
          var optionProtoName = 'BasicWebComOption#' + proto.typeGlobal + '#' + key,
          // Find itself event not already registered into wjs.
          // Store all protos into WebCom loader only
          // It is not referenced into wjs when called from construct method.
            self = (this.wjs.loaders.WebCom || this),
          // Try to find option.
            option = self.optionsProtos[optionProtoName],
          // Find option proto from scheme.
            optionProto = scheme.options[key];
          // Option is not already created.
          if (!option) {
            // Create instance.
            self.optionsProtos[optionProtoName] = option = this.optionCreate(proto, optionProtoName, key, optionProto);
          }
          this._protoParseOptionsSave(proto, key, option);
        }
      }
      // Parent prototype adds options.
      // Add option from base class if not overridden.
      var protoParent = Object.getPrototypeOf(proto);
      // Inherit non overridden options from parent.
      if (protoParent.options) {
        for (i = 0, keys = Object.keys(protoParent.options); key = keys[i++];) {
          // If no local declaration for to prototype.
          if (!proto.options[key]) {
            this._protoParseOptionsSave(proto, key, protoParent.options[key]);
          }
        }
      }
    },

    _protoParseOptionsSave: function (proto, name, option) {
      proto.options[name] = option;
      // Create a variable entry.
      proto.variables[name] = option.defaults || proto.variables[name];
    },

    protoParseOptionsDefault: function (proto, scheme, item) {
      // Inherit options defaults variables.
      this.inheritObject(proto, scheme, item);
    },

    protoParseMixin: function (proto, scheme, item) {
      for (var i = 0, key; key = scheme[item][i++];) {
        this._mixinProto(proto, key);
      }
    },

    /**
     * Merge descriptions from constructor.
     */
    _mixinProto: function (proto, name) {
      // Method must be loaded.
      var methods = this.wjs.classProtos[name].prototype;
      this._mixinProtoItem(proto, methods, 'variables');
      this._mixinProtoItem(proto, methods, 'options');
      this._mixinProtoItem(proto, methods, 'optionsDefault');
    },

    /**
     * @require JsMethod > objectFill
     */
    _mixinProtoItem: function (proto, methods, name) {
      // variable name can not exists int method,
      // some variables are created by
      // inheritance on object instantiation.
      if (methods[name]) {
        if (!proto[name]) {
          // Create object if not defined.
          proto[name] = Array.isArray(methods[name]) ? [] : {};
        }
        this.wjs.objectFill(proto[name], methods[name], true);
      }
    },

    protoParseCallbacks: function (proto, scheme) {
      this.methodsFlatten(proto, scheme, 'callbacks', 2);
    },

    /**
     * Create a new instance of specified factory class.
     */
    instance: function (name, options) {
      var wjs = this.wjs, protoName = this.protoName(name),
      // Base options can be defined from server side.
        optionsBase = wjs.extendObject({}, wjs.get(this.type, name) || {});
      // Local options overrides.
      wjs.extendObject(optionsBase, options || {});
      // Prevent to create undefined instances.
      if (this.wjs.classMethods[protoName]) {
        return new (wjs.classProto(protoName))(optionsBase);
      }
      wjs.err('Trying to create undefined instance ' + protoName);
    },

    instanceRegister: function (com) {
      // Save into webcom global registry.
      this.wjs.loaders.WebCom.webComRegister(com);
      // Count.
      this.instancesCount[com.type] = (this.instancesCount[com.type] || 0) + 1;
      // Local register.
      this.instances[com.id] = com;
    },

    instanceRemove: function (com) {
      // Remove from webcom global registry.
      this.wjs.loaders.WebCom.webComRemove(com);
      // Count.
      this.instancesCount[com.type]--;
      if (!this.instancesCount[com.type]) {
        delete this.instancesCount[com.type];
      }
      // Local remove.
      delete this.instances[com.id];
    },

    webComRegister: function (com) {
      // Save into webcom global registry.
      this.webComList[com.id] = com;
      // Increment counter to ensure unique IDs.
      this.webCompCounter += 1;
    },

    webComRemove: function (com) {
      // Remove global reference.
      delete this.webComList[com.id];
    },

    wjsInclude: function (type, name, dom, options) {
      options = this.wjs.extendObject(options || {}, this.wjs.get(type, name));
      options.dom = dom;
      options.domImported = true;
      // Create instance.
      this.instance(name, options);
    }
  });
}(WjsProto));
