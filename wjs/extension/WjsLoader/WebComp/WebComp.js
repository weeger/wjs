/**
 * @require WjsLoader > JsMethod
 * @require WjsLoader > CssLink
 * @require WjsLoader > JsLink
 * @require WjsLoader > JsClass
 * @require WjsLoader > JsClassStatic
 * @require JsMethod > objectToArray
 * @require JsMethod > urlQueryParse
 * @require JsMethod > urlQueryBuild
 * @require JsClassStatic > wjsHref
 * @require JsClass > BasicWebComp
 */
(function (WjsProto) {
  'use strict';
  // <--]
  WjsProto.register('WjsLoader', 'WebComp', {

    __construct: function () {
      this.staticClasses = {};
      WjsProto.proto.Loader.__construct.call(this);
    },

    parse: function (name, value, process) {
      var destination = process.options.destination || value.destination;
      // If a js file is attached, it have been already
      // loaded, and registered items are waiting to be parsed.
      if (WjsProto.registerGet(this.type, name)) {
        // Execute callback, avoid to add an event listener.
        this.registerListen(this.type, name, process, value);
      }
      this.include(name, destination, value);
      return value;
    },

    /**
     * @require JsMethod > staticClass
     */
    register: function (type, name, process, value) {
      var proto = WjsProto.retrieve(this.type, name);
      proto.classExtends = 'BasicWebComp';
      this.staticClasses[name] = this.wjs.staticClass(this.type + name, proto);
    },

    /**
     * @require JsMethod > wjsIncludeTag
     */
    include: function (name, destination, value) {
      var wjs = this.wjs, params, type = this.type,
        wjsHref = wjs.loaders.JsClassStatic.staticClasses.wjsHref,
        staticClasses = this.staticClasses,
      // Create dom component.
        dom = wjs.document.createElement('div');
      value = value || wjs.get(type, name);
      value.dom = dom;
      dom.innerHTML = value.html;
      dom.classList.add(type + '-' + name);
      // Append it if query selector specified.
      if (destination) {
        // Destination may be a query selector string
        // or a direct reference to a dom component.
        value.domDestination =
          typeof destination === 'string' ?
            wjs.window.document.querySelector(destination) : destination;
        value.domDestination.appendChild(dom);

        if (wjsHref) {
          // Parse all node to search for wjs links.
          wjsHref.linksInit(value.domDestination);
        }
      }
      // Save status to URL if asked.
      if (value.urlUpdate) {
        // Load used class.
        params = wjs.urlQueryParse();
        params[type] = params[type] || [];
        if (value.group) {
          if (params[type][value.group] && params[type][value.group] !== name) {
            wjs.destroy(type, params[type][value.group], true);
          }
          params[type][value.group] = name;
        }
        // Avoid multiple insertion.
        else if (params[type].indexOf(name) === -1) {
          params[type].push(name);
        }
        wjs.window.history.replaceState(null, null, '?' + wjs.urlQueryBuild(params));
      }
      // Execute init function if a local class
      // has been defined for this component.
      if (!staticClasses[name]) {
        staticClasses[name] = new (wjs.classProto('BasicWebComp'))();
      }
      // Define defaults.
      wjs.extendObject(staticClasses[name], value);
      staticClasses[name].init(value);
      // Start fade animation.
      if (staticClasses[name].fadeInClass) {
        wjs.cssAnimateCallback(dom, 'fadeIn', true);
      }
      // Search for includes.
      wjs.wjsIncludeTag(dom);
    },

    /**
     * @require JsMethod > wjsIncludeTagDestroy
     */
    destroy: function (name, value, process) {
      var self = this, staticClass = self.staticClasses[name],
      // Callback will be launched two times.
        callback = function () {
          // Destroy complete wait for both animation complete
          // and children deletion.
          if (staticClass.fadeOutComplete && staticClass.destroyChildComplete) {
            self.destroyComplete(name, value, process);
          }
        };
      // Proto may nom exists.
      if (!staticClass) {
        return true;
      }
      // Destroy complete wait for children deletion.
      staticClass.destroyChildComplete = false;
      // Launch fadeout animation if exists and not already terminated.
      self.webCompExit(name, callback);
      // Destroy children.
      wjs.wjsIncludeTagDestroy(value.dom, function () {
        staticClass.destroyChildComplete = true;
        // Mark destroy starting with a css class,
        // Allow to start animation during children deletion.
        value.dom.classList.add('fadeOutChildrenComplete');
        callback();
      });
      // Stop destroy queue.
      return false;
    },

    destroyComplete: function (name, value, process) {
      var self = this, remove = true, params,
        index, staticClass = self.staticClasses[name];
      if (!(value instanceof self.wjs.window.Error)) {
        if (staticClass) {
          if (staticClass.exit) {
            remove = staticClass.exit(self.type, name, value, process);
          }
        }
        // Remove item from url history.
        if (value.urlUpdate) {
          params = self.wjs.urlQueryParse();
          if (params[self.type]) {
            if (value.group) {
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
      if (remove) {
        // Save item as completely destroyed.
        // And continue parsing.
        process.itemDestroyComplete(self.type, name);
      }
    },

    domRemove: function (staticClass) {
      if (staticClass.dom.parentNode) {
        staticClass.dom.parentNode.removeChild(staticClass.dom);
      }
    },

    /**
     * Exit a WebComp by executing his fadeout animation.
     * Return true if animation started.
     * @require JsMethod > cssAnimateCallback
     * @require JsMethod > wjsIncludeTagExit
     */
    webCompExit: function (name, callback) {
      var self = this, wjs = self.wjs, staticClass = self.staticClasses[name],
        className = typeof staticClass.fadeOutClass === 'string' ? staticClass.fadeOutClass : 'fadeOut';
      // Class may not exists.
      if (!staticClass) {
        return false;
      }
      // Exit child class.
      wjs.wjsIncludeTagExit(staticClass.dom);
      // Only one exit for webComp.
      if (staticClass.fadeOutStarted === true) {
        if (callback) {
          staticClass.fadeOutCallback.push(callback);
        }
        return false;
      }
      // Class must have a fadeout class to work.
      if (!staticClass.fadeOutClass || staticClass.fadeOutComplete === true) {
        // No animation.
        staticClass.fadeOutComplete = true;
        return false;
      }
      // Prepare.
      staticClass.fadeOutStarted = true;
      staticClass.fadeOutComplete = false;
      staticClass.fadeOutCallback = callback ? [callback] : [];
      // Place fadeout css, and wait complete.
      wjs.cssAnimateCallback(staticClass.dom, className, function (e) {
        self.domRemove(staticClass);
        staticClass.dom.classList.remove(className);
        // We just work on direct dom level.
        e.stopPropagation();
        staticClass.fadeOutComplete = true;
        if (staticClass.fadeOutCallback && staticClass.fadeOutCallback.length) {
          wjs.callbacks(staticClass.fadeOutCallback);
        }
      });
      return true;
    }
  });
  // [-->
}(WjsProto));
