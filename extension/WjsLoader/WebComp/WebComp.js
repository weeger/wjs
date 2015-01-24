/**
 * @require WjsLoader > JsMethod
 * @require WjsLoader > CssLink
 * @require WjsLoader > JsLink
 * @require WjsLoader > JsClass
 * @require JsMethod > staticClass
 * @require JsMethod > objectToArray
 * @require JsMethod > urlQueryParse
 * @require JsMethod > urlQueryBuild
 * @require JsClass > WjsWebCompBaseClass
 */
(function (context) {
  'use strict';
  // <--]
  context.wjs.loaderAdd('WebComp', {
    staticClasses: {},

    __construct: function () {
      var self = this, i;
      // Create a shortcut in wjs for external scripts handling.
      self.wjs['ready' + self.type] = self.readyWebComp.bind(self);
      self.wjs['staticClass' + self.type] = self.staticClassWebComp.bind(self);
      // List of callbacks.
      self.readyCallbacks = {};
      self.wjs.classMethods.WjsLoader.__construct.apply(self, arguments);
    },

    __destruct: function () {
      delete this.wjs['ready' + this.type];
      delete this.wjs['staticClass' + this.type];
      delete this.wjs.classMethods.WjsWebCompBaseClass;
    },

    parse: function (name, value, process) {
      var self = this, wjs = this.wjs, params,
        destination = process.options.destination || value.destination;
      // Create dom component.
      value.dom = wjs.document.createElement('div');
      value.dom.innerHTML = value.html;
      value.dom.classList.add(self.type + '-' + name);
      // Append it if query selector specified.
      if (destination) {
        // Destination may be a query selector string
        // or a direct reference to a dom component.
        value.domDestination =
          typeof destination === 'string' ?
            wjs.window.document.querySelector(destination) : destination;
        value.domDestination.appendChild(value.dom);
        if (wjs.wjsHref) {
          // Parse all node to search for wjs links.
          wjs.wjsHref.linksInit(value.domDestination);
        }
      }
      // Save status to URL if asked.
      if (value.urlUpdate) {
        // Load used class.
        params = self.wjs.urlQueryParse();
        params[self.type] = params[self.type] || [];
        if (value.group) {
          if (params[self.type][value.group] && params[self.type][value.group] !== name) {
            wjs.destroy(this.type, params[self.type][value.group], true);
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
      if (this.staticClasses[name] && this.staticClasses[name].init) {
        wjs.extendObject(this.staticClasses[name], value);
        this.staticClasses[name].init(value);
      }
      return value;
    },

    destroy: function (name, value, process) {
      var self = this, remove = true, params, itemsSaved, index;
      if (!(value instanceof self.wjs.window.Error)) {
        if (this.staticClasses[name] && this.staticClasses[name].exit) {
          remove = this.staticClasses[name].exit(self.type, name, value, process);
        }
        if (remove && value.dom.parentNode) {
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
      }
      return remove;
    },

    readyWebComp: function (docName, callback) {
      this.readyCallbacks[docName] = callback.bind(wjs);
    },

    staticClassWebComp: function (name, proto) {
      // It must be an instance of special class.
      proto.classExtends = proto.classExtends || 'WjsWebCompBaseClass';
      this.staticClasses[name] = this.wjs.staticClass('WjsWebCompBaseClass' + name, proto);
    }
  });
  // [-->
}(wjsContext));
