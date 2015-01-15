(function (loader) {
  'use strict';
  var wjs = loader.wjs;
  /**
   * Detects html container of wjs extensions.
   */
  loader.addJsClassStatic('lazyTagsLoad', {
    destinationRoutes: [],
    destinationActivated: {},
    destinationOriginalHtml: {},
    typesCounter: {},
    wjs: wjs,
    screenWidth: 0,
    screenHeight: 0,
    processing: false,

    __construct: function () {
      var self = this, wjs = self.wjs, callback = self.onScreenChange.bind(self);
      // Wait for wjs.
      wjs.ready(function () {
        // Search for tags into whole document.
        self.tagsDetect(wjs.document);
        // Activate currently visible elements.
        self.tagsVisibleActivateAll();
        // Add listeners.
        wjs.window.addEventListener('scroll', callback);
        wjs.window.addEventListener('resize', callback);
      });
    },

    onScreenChange: function () {
      this.tagsVisibleActivateAll();
    },

    tagsDetect: function (domElement) {
      var self = this, i = 0, dom = domElement.querySelectorAll('[data-wjs]'), complete;
      for (; i < dom.length; i++) {
        // Add to routes if not exists.
        if (self.destinationRoutes.indexOf(dom[i]) === -1) {
          self.destinationRoutes.push(dom[i]);
        }
      }
    },

    tagsVisibleActivateAll: function () {
      var i = 0, visible = [], self = this, wjs = self.wjs,
        type, name, info, value,
        split, dom, rect, saved,
        request = {},
      // Get scroll position.
        scrollTop = wjs.window.pageYOffset || wjs.document.documentElement.scrollTop,
        scrollLeft = wjs.window.pageXOffset || wjs.document.documentElement.scrollLeft;
      for (; i < self.destinationRoutes.length; i++) {
        // Get position.
        dom = self.destinationRoutes[i];
        rect = dom.getBoundingClientRect();
        saved = self.destinationActivated[i];
        // Get the type / name couple of items.
        info = self.tagType(dom);
        type = info.type;
        name = info.name;
        // Element is not outside vertically (bottom).
        if ((rect.top + scrollTop) < (wjs.window.innerHeight + scrollTop) &&
          // Element is not outside vertically (top).
          (rect.top + rect.height + scrollTop) > (scrollTop) &&
          // Element is not outside horizontally (right).
          (rect.left + scrollLeft) < (wjs.window.innerWidth + scrollLeft) &&
          // Element is not outside horizontally (left).
          (rect.left + rect.width + scrollLeft) > (scrollLeft)) {
          // Only unsaved need a request,
          // else do nothing.
          if (!saved) {
            // Save as activated.
            self.destinationActivated[i] = dom;
            // Load saved value.
            value = wjs.get(type, name);
            // Element is already loaded by wjs,
            // so we just have to fill dom item
            // with existing data (no reload allowed).
            if (value) {
              self.tagFill(type, name, dom, value);
            }
            else {
              // Save into elements list to proceed.
              visible[type] = visible[type] || {};
              visible[type][name] = visible[type][name] || [];
              visible[type][name].push(dom);
              // Add to server request.
              request[type] = request[type] || [];
              if (request[type].indexOf(name) === -1) {
                request[type].push(name);
              }
            }
          }
        }
        // Element is outside allowed area.
        else if (saved) {
          self.tagEmpty(type, name, dom);
        }
      }
      // Launch multi-request.
      wjs.use(request, {
        destination: false,
        lazyVisible: visible,
        // We are not able to use complete() function properly
        // to remove wjsTempId, due to a loading bug with several successive loads
        complete: self.useComplete.bind(self)
      });
    },

    tagType: function (dom) {
      // Get the type / name couple of items.
      var split = dom.getAttribute('data-wjs').split(':');
      return {
        type: split[0],
        name: split[1]
      };
    },

    tagFill: function (type, name, dom, regData) {
      var self = this;
      // Backup current html in case of destroy.
      self.destinationOriginalHtml[self.destinationRoutes.indexOf(dom)] = dom.innerHTML;
      // Data must have a dom property (WebComp).
      dom.appendChild(regData.dom.cloneNode(true));
      self.typesCounter[type] = self.typesCounter[type] || {};
      self.typesCounter[type][name] = self.typesCounter[type][name] || 0;
      self.typesCounter[type][name]++;
    },

    tagEmpty: function (type, name, dom) {
      var self = this, routeIndex = self.destinationRoutes.indexOf(dom);
      if (routeIndex !== -1) {
        while (dom.firstChild) {
          dom.removeChild(dom.firstChild);
        }
        dom.innerHTML = self.destinationOriginalHtml[routeIndex];
        delete self.destinationActivated[routeIndex];
        delete self.destinationOriginalHtml[routeIndex];
        self.typesCounter[type][name]--;
        if (self.typesCounter[type][name] === 0 && self.wjs.settings.lazyTagsLoadAutoDestroy) {
          self.wjs.destroy(type, name, true);
          delete self.typesCounter[type][name];
          if (self.wjs.objectIsEmpty(self.typesCounter[type])) {
            delete self.typesCounter[type];
          }
        }
      }
    },

    useComplete: function (register, process) {
      var i = 0, j, k, types = Object.keys(process.options.lazyVisible), names, items;
      // Iterates over visible items who need to be filled.
      for (; i < types.length; i++) {
        names = Object.keys(process.options.lazyVisible[types[i]]);
        for (j = 0; j < names.length; j++) {
          items = process.options.lazyVisible[types[i]][names[j]];
          for (k = 0; k < items.length; k++) {
            this.tagFill(types[i], names[j], items[k], register[types[i]][names[j]]);
          }
        }
      }
    }
  });
}(loader));
