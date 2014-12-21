/**
 * @require JsMethod > localClass
 * @require JsMethod > objectToArray
 * @require JsMethod > urlQueryParse
 * @require JsMethod > urlQueryBuild
 */
(function (context) {
  'use strict';
  // <--]
  /**
   * Base class for WebComp elements.
   */
  context.wjs.classExtend('WjsWebCompLocalClass', {
    init: function () {
      // To override...
      return true;
    },
    exit: function () {
      // To override...
      return true;
    },
    webCompRemove: function () {
      this.dom.parentNode.removeChild(this.dom);
    }
  });

  context.wjs.loaderAdd('WebComp', {
    localClasses: {},

    __construct: function () {
      var self = this, i, param = self.wjs.urlQueryParse();
      // Create a shortcut in wjs for external scripts handling.
      self.wjs['ready' + self.type] = self.readyWebComp.bind(self);
      self.wjs['localClass' + self.type] = self.localClassWebComp.bind(self);
      // List of callbacks.
      self.readyCallbacks = {};
      self.wjs.classMethods.WjsLoader.__construct.apply(self, arguments);
      this.initParam = self.wjs.urlQueryParse();
    },

    __destruct: function () {
      delete this.wjs['ready' + this.type];
      delete this.wjs['localClass' + this.type];
      delete this.wjs.classMethods.WjsWebCompLocalClass;
    },

    init: function () {
      var self = this, i = 0, param = this.initParam, keys;
      // Load items presents into URL query string.
      if (param[self.type]) {
        keys = Object.keys(param[self.type]);
        for (; i < keys.length; i++) {
          self.wjs.use(this.type, param[self.type][keys[i]]);
        }
      }
    },

    parse: function (name, value, process) {
      var self = this, params;
      // Create dom component.
      value.dom = this.wjs.document.createElement('div');
      value.dom.innerHTML = value.html;
      value.dom.setAttribute('id', this.type + '-' + name);
      // Append it if query selector specified.
      if (value.destination) {
        value.domDestination = this.wjs.window.document.querySelector(value.destination);
        value.domDestination.appendChild(value.dom);
        // Parse all node to search for wjs links.
        this.wjs.linksInit(value.domDestination);
      }
      // Save status to URL if asked.
      if (value.urlUpdate) {
        // Load used class.
        params = self.wjs.urlQueryParse();
        params[self.type] = params[self.type] || [];
        if (value.group) {
          if (params[self.type][value.group]) {
            this.wjs.destroy(this.type, params[self.type][value.group], true);
          }
          params[self.type][value.group] = name;
        }
        // Avoid multiple insertion.
        else if (params[self.type].indexOf(name) === -1) {
          params[self.type].push(name);
        }
        self.wjs.window.history.replaceState(null, null, '?' + self.wjs.urlQueryBuild(params));
      }
      // Execute init function if a local class
      // has been defined for this page.
      if (this.localClasses[name] && this.localClasses[name].init) {
        this.wjs.extendObject(this.localClasses[name], value);
        this.localClasses[name].init(value);
      }
      return value;
    },

    destroy: function (name, value, queue) {
      var self = this, remove = true, params, itemsSaved, index;
      if (this.localClasses[name] && this.localClasses[name].exit) {
        remove = this.localClasses[name].exit(value, queue);
      }
      if (remove) {
        value.dom.parentNode.removeChild(value.dom);
      }
      // Remove item from url history.
      if (value.urlUpdate) {
        params = self.wjs.urlQueryParse();
        if (params[self.type]) {
          if (value.group) {
            index = params[self.type][value.group] ? value.group : -1;
            delete params[self.type][value.group];
          }
          else {
            // Remove all instance of item.
            index = params[self.type].indexOf(name);
            while (index !== -1) {
              params[self.type].splice(index, 1);
              index = params[self.type].indexOf(name);
            }
          }
          self.wjs.window.history.replaceState(null, null, '?' + self.wjs.urlQueryBuild(params));
        }
      }
      return remove;
    },

    readyWebComp: function (docName, callback) {
      this.readyCallbacks[docName] = callback.bind(wjs);
    },

    localClassWebComp: function (name, proto) {
      // It must be an instance of special class.
      proto.classExtends = proto.classExtends || 'WjsWebCompLocalClass';
      this.localClasses[name] = this.wjs.localClass('WjsWebCompLocalClass' + name, proto);
    }
  });
  // [-->
}(wjsContext));
