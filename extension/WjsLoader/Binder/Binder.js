/**
 * @require WjsLoader > WebCom
 * @require JsScript > SchemeBinder
 */
(function (W) {
  'use strict';
  var regReplaceSlashes = new RegExp('\\.', 'g');
  W.register('WjsLoader', 'Binder', {
    // Extends full named loader class.
    loaderExtends: 'WebCom',
    protoBaseClass: 'Binder',

    __construct: function () {
      this.wjs.extendObject(this, {
        domStyle: {},
        cssSheetLoadQueue: [],
        classSaved: {},
        classLists: {},
        cssClassCounter: 0,
        cssDomItems: {},
        cssRewritten: {}
      });
      this.wjs.loaders.WebCom.__construct.call(this);
    },

    parse: function (name, value, process) {
      var type = this.type, self = this, args = arguments,
        protoName = this.protoName(name);
      // Reset queue.
      this.cssSheetLoadQueue = [];
      // Css data only.
      if (value.css) {
        // Create a <style> tag associated to dom
        this.cssDomInitType(protoName, value, true);
      }
      // New <style> tag are async loaded.
      this.cssSheetLoadAll(function () {
        // Complete loading.
        process.itemParseComplete(type, name,
          // Parse components.
          self.wjs.loaders.WebCom.parse.apply(self, args));
      });
      // Wait for load complete.
      return false;
    },

    protoAddPart: function (name) {
      var protoName = this.protoName(name);
      this.wjs.loaders.WebCom.protoAddPart.apply(this, arguments);
      // Create CSS classes for dom,
      // css can be inherited from parent.
      this.cssClassInit(protoName, true);
    },

    cssSheetLoadAll: function (complete) {
      var self = this, check = function () {
        var domCss = self.cssSheetLoadQueue.shift();
        if (domCss) {
          self.wjs.cssSheetLoad(domCss, check);
        }
        else if (complete) {
          complete();
        }
      };
      check();
    },

    /**
     * Create a dom "style" element for the specified
     * binder type, if css data are stored into definition.
     */
    cssDomInitType: function (protoName, data, toggle) {
      // One CSS file per type, named with
      // the name of main object.
      var domStyle = this.domStyle,
        cssDomItems = this.cssDomItems;
      if (toggle) {
        cssDomItems[protoName] = cssDomItems[protoName] || 0;
        cssDomItems[protoName]++;
        // Create CSS for whole bundle if not exists.
        if (data.css && !domStyle[protoName]) {
          // Append new style tag
          domStyle[protoName] = this.wjs.document.createElement('style');
          // Place CSS into it.
          // Add client path to relative URLs.
          domStyle[protoName].innerHTML = data.css.replace(new RegExp('(url\\(["\'])(?!http[s]*:\/\/)', 'g'), '$1' + data.client);
          // Add to load queue.
          this.cssSheetLoadQueueAppend(domStyle[protoName]);
          // Append to head.
          this.wjs.document.head.appendChild(domStyle[protoName]);
        }
      }
      else {
        cssDomItems[protoName]--;
        if (cssDomItems[protoName] === 0 && domStyle[protoName]) {
          domStyle[protoName].parentNode.removeChild(domStyle[protoName]);
          delete domStyle[protoName];
        }
      }
    },

    cssSheetLoadQueueAppend: function (domStyle) {
      // Add to load queue
      if (this.cssSheetLoadQueue.indexOf(domStyle) === -1) {
        this.cssSheetLoadQueue.push(domStyle);
      }
    },

    cssClassInit: function (protoName, toggle) {
      var i = 0, item,
        insideBinder = false,
        typeCss,
        typePart,
        lineage = this.wjs.classProtoLineage(protoName),
        lineagePart = [],
        typeGlobal = lineage.join('-'),
        cssRewritten = this.cssRewritten;
      while (item = lineage[i++]) {
        // Append to class name.
        lineagePart.push(item);
        // Exclude types before binder,
        // which not using css.
        if (item === 'Binder') {
          insideBinder = true;
        }
        // We can search for classes and css rules.
        if (insideBinder) {
          // Replace dots by underscores into global name.
          typeCss = item.replace(regReplaceSlashes, '_');
          typePart = lineagePart.join('-');
          // Add or remove.
          if (toggle) {
            // Create new css classes
            this.cssClassAdd(typePart, typeGlobal);
            // Replace full class name by shorten version.
            this.cssRewriteAll(typeCss, this.classSaved[typePart]);
            cssRewritten[typePart] = cssRewritten[typePart] || 0;
            cssRewritten[typePart]++;
            if (this.classLists[typeGlobal].indexOf(this.classSaved[typePart]) === -1) {
              // Add only class when css rules has been detected.
              this.classLists[typeGlobal].push(this.classSaved[typePart]);
            }
          }
          else {
            cssRewritten[typePart]--;
            if (!cssRewritten[typePart]) {
              // Replace shorten class name by full version.
              this.cssRewriteAll(this.classSaved[typePart], typeCss);
              this.cssClassRemove(typePart, typeGlobal);
            }
          }
        }
      }
    },

    cssClassAdd: function (typePart, typeGlobal) {
      var classSaved = this.classSaved,
        classLists = this.classLists;
      if (!classSaved[typePart]) {
        classSaved[typePart] = 'c' + this.cssClassCounter++;
      }
      // Save list of classes for this global type.
      // These classes will be applied on class list.
      classLists[typeGlobal] = classLists[typeGlobal] || [];
    },

    cssClassRemove: function (typePart, typeGlobal) {
      var classSaved = this.classSaved,
        classLists = this.classLists;
      if (classSaved[typePart]) {
        delete this.classSaved[typePart];
      }
      if (classLists[typeGlobal]) {
        delete classLists[typeGlobal];
      }
    },

    cssRewriteAll: function (replaceFrom, replaceBy) {
      // Get list of all styles tags.
      var i = 0, domStyle = this.domStyle,
        keys = Object.keys(domStyle);
      // Iterates over the dom styles tags.
      for (; i < keys.length; i++) {
        this.cssRewrite(replaceFrom, replaceBy, domStyle[keys[i]]);
      }
    },

    cssRewrite: function (type, className, domStyle) {
      // Save match as renamed.
      domStyle.innerHTML = domStyle.innerHTML.replace(
        // Replace .className by .cX class name generated.
        new RegExp('\\.' + type + '(?=[\\s*|{|,|.|-|:])', 'g'),
        '.' + className);
      this.cssSheetLoadQueueAppend(domStyle);
    }
  });
}(W));
