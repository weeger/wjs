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
    shortcutName: 'webComp',
    webCompLocalClasses: {},

    __construct: function () {
      var self = this, i, param = self.wjs.urlQueryParse();
      this.regLink = new RegExp('^wjs://([a-zA-Z0-9]*):([a-zA-Z0-9]*)$');
      // Create a shortcut in wjs for external scripts handling.
      self.wjs[self.shortcutName + 'Ready'] = self.webCompReady.bind(self);
      self.wjs[self.shortcutName + 'LocalClass'] = self.webCompLocalClass.bind(self);
      // List of callbacks.
      self.readyCallbacks = {};
      self.wjs.classMethods.WjsLoader.__construct.apply(self, arguments);
      // Load items presents into hash URLs.
      if (param[self.type]) {
        for (i = 0; i < param[self.type].length; i++) {
          this.query(param[self.type][i]);
        }
      }
    },

    __destruct: function () {
      delete this.wjs[this.shortcutName + 'Ready'];
      delete this.wjs[this.shortcutName + 'LocalClass'];
      delete this.wjs.classMethods.WjsWebCompLocalClass;
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
        // Parse all node to search for
        var i, href, domAll = value.domDestination.querySelectorAll('*[href]');
        for (i = 0; i < domAll.length; i++) {
          if (domAll[i].hasAttribute('href')) {
            href = domAll[i].getAttribute('href');
            if (href.match(this.regLink)) {
              domAll[i].setAttribute('href', 'javascript:void(0);');
              domAll[i].setAttribute('data-wjs-link', href);
              domAll[i].addEventListener('click', this.listenCallbackClick.bind(this));
            }
          }
        }
      }
      // Save status to URL if asked.
      if (value.urlUpdate) {
        // Load used class.
        params = self.wjs.urlQueryParse();
        if (!params[self.type]) {
          params[self.type] = [];
        }
        if (params[self.type].indexOf(name) === -1) {
          params[self.type].push(name);
        }
        self.wjs.window.history.replaceState(null, null, '?' + self.wjs.urlQueryBuild(params));
      }
      // Execute init function if a local class
      // has been defined for this page.
      if (this.webCompLocalClasses[name] && this.webCompLocalClasses[name].init) {
        this.wjs.extendObject(this.webCompLocalClasses[name], value);
        this.webCompLocalClasses[name].init(value);
      }
      return value;
    },

    listenCallbackClick: function (e) {
      var link = e.target.getAttribute('data-wjs-link').match(this.regLink);
      if (this.wjs.loaders[link[1]]) {
        this.wjs.loaders[link[1]].link(link[2], e);
      }
      else {
        this.wjs.use(link[1], link[2]);
      }
    },

    destroy: function (name, value, queue) {
      var self = this, remove = true, params, itemsSaved, index;
      if (this.webCompLocalClasses[name] && this.webCompLocalClasses[name].exit) {
        remove = this.webCompLocalClasses[name].exit(value, queue);
      }
      if (remove) {
        value.dom.parentNode.removeChild(value.dom);
      }
      // Remove item from url history.
      if (value.urlUpdate) {
        params = self.wjs.urlQueryParse();
        if (params[self.type]) {
          // Remove all instance of item.
          index = params[self.type].indexOf(name);
          while (index !== -1) {
            params[self.type].splice(index, 1);
            index = params[self.type].indexOf(name);
          }
          self.wjs.window.history.replaceState(null, null, '?' + self.wjs.urlQueryBuild(params));
        }
      }
      return remove;
    },

    webCompReady: function (docName, callback) {
      this.readyCallbacks[docName] = callback.bind(wjs);
    },

    webCompLocalClass: function (name, proto) {
      // It must be an instance of special class.
      proto.classExtends = proto.classExtends || 'WjsWebCompLocalClass';
      this.webCompLocalClasses[name] = this.wjs.localClass('WjsWebCompLocalClass' + name, proto);
    }
  });
  // [-->
}(wjsContext));
