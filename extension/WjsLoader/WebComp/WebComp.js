/**
 * Loads javascript factory constructor.
 * Explicitly loads JsClass loader to reduce requests.
 * @require WjsLoader > JsClass
 * @require WjsLoader > CssLink
 * @require JsClass > BasicWebComp
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('WjsLoader', 'WebComp', {
    protoBaseClass: 'BasicWebComp',

    __construct: function () {
      this.wjs.extendObject(this, {
        webCompCounter: 0,
        webCompList: {},
        wjsShortcuts: false,
        instancesCount: {}
      });
      // Use base construction.
      WjsProto.proto.Loader.__construct.call(this);
    },

    parse: function (name, value, process) {
      // If a js file is attached, it have been already
      // loaded, and registered items are waiting to be parsed.
      this.protoAdd(name, WjsProto.retrieve(this.type, name), name);
      // Enable.
      WjsProto.proto.Loader.parse.apply(this, arguments);
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
     */
    protoAdd: function (name, proto, pack) {
      var i, keys, protoName = this.protoName(name);
      // Set type
      proto = proto || {};
      proto.type = name;
      proto.loader = this;
      proto.pack = pack;
      proto.classExtends = (!proto.hasOwnProperty('classExtends') ? this.protoBaseClass : proto.classExtends);
      this.wjs.classExtend(protoName, proto);
      proto.typeGlobal = this.wjs.classProtoLineage(protoName).join('-');
      // Apply types names for sub packages.
      if (proto.hasOwnProperty('bundle')) {
        keys = Object.keys(proto.bundle);
        for (i = 0; i < keys.length; i++) {
          this.protoAdd(
            // Give a bundler name.
            name + '.' + keys[i],
            // Give part of data.
            proto.bundle[keys[i]],
            // Save reference to the global package
            pack);
        }
      }
      return this.wjs.classMethods[protoName];
    },

    /**
     * Create a new instance of specified factory class.
     */
    instance: function (name, options) {
      var wjs = this.wjs, protoName = this.protoName(name);
      // Prototype must exists.
      if (!wjs.classMethods[protoName]) {
        wjs.err('Methods not found for ' + protoName);
      }
      options = options || wjs.get(this.type, name) || {};
      options.loader = this;
      this.instancesCount[name] = (this.instancesCount[name] || 0) + 1;
      return new (wjs.classProto(protoName))(options);
    },

    instanceDestroy: function (binder) {
      if (--this.instancesCount[binder.type] === 0) {
        delete this.instancesCount[binder.type];
      }
    },

    wjsInclude: function (type, name, dom) {
      var options = this.wjs.get(type, name);
      options.dom = dom;
      options.domImported = true;
      // Create instance.
      this.instance(name, options);
    }
  });
}(WjsProto));
