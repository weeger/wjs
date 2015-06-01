/**
 * @require WjsLoader > WebComp
 * @require JsClass > BasicBinder
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('WjsLoader', 'Binder', {
    // Extends full named loader class.
    loaderExtends: 'WebComp',
    protoBaseClass: 'BasicBinder',

    __construct: function () {
      this.wjs.extendObject(this, {
        domStyle: {},
        cssSheetLoadQueue: [],
        classSaved: {},
        classLists: {},
        cssClassCounter: 0,
        cssDomItems: {},
        cssRewritten: {},
        regReplaceSlashes: new RegExp('\\.', 'g')
      });
      this.wjs.loaders.WebComp.__construct.call(this);
    },

    parse: function (name, value, process) {
      var type = this.type,
        output = this.wjs.loaders.WebComp.parse.apply(this, arguments),
        protoName = this.protoName(name);
      if (value.css) {
        this.cssDomInit(protoName, value.css, true);
        this.cssClassInit(protoName, true);
        this.cssSheetLoadAll(function () {
          process.itemParseComplete(type, name, output);
        });
        return false;
      }
      return output;
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
     * Initialize binder according to all its
     * object classes dependencies.
     */
    cssDomInit: function (protoName, cssData, toggle) {
      var i = 0, name, lineage = this.wjs.classProtoLineage(protoName);
      while (name = lineage[i++]) {
        this.cssDomInitType(this.protoName(name), cssData, toggle);
      }
    },

    /**
     * Create a dom "style" element for the specified
     * binder type, if css data are stored into definition.
     */
    cssDomInitType: function (protoName, cssData, toggle) {
      // One CSS file per type, named with
      // the name of main object.
      var domStyle = this.domStyle,
        cssDomItems = this.cssDomItems;
      if (toggle) {
        cssDomItems[protoName] = cssDomItems[protoName] || 0;
        cssDomItems[protoName]++;
        // Create CSS for whole bundle if not exists.
        if (cssData && !domStyle[protoName]) {
          // Append new style tag
          domStyle[protoName] = this.wjs.document.createElement('style');
          // Place CSS into it.
          // Add client path to relative URLs.
          domStyle[protoName].innerHTML = cssData.replace(new RegExp('(url\\(["\'])(?!http[s]*:\/\/)', 'g'), '$1' + cssData.client);
          // Add to load queue
          this.cssSheetLoadQueue.push(domStyle[protoName]);
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

    cssClassInit: function (protoName, toggle) {
      var i = 0,
        insideBinder = false,
        typeCss,
        typePart,
        lineage = this.wjs.classProtoLineage(protoName),
        lineagePart = [],
        typeGlobal = lineage.join('-');
      for (; i < lineage.length; i++) {
        // Append to class name.
        lineagePart.push(lineage[i]);
        // Exclude types before binder,
        // which not using css.
        if (lineage[i] === 'Binder') {
          insideBinder = true;
        }
        // We can search for classes and css rules.
        if (insideBinder) {
          // Replace dots by underscores into global name.
          typeCss = lineage[i].replace(this.regReplaceSlashes, '_');
          typePart = lineagePart.join('-');
          // Add or remove.
          if (toggle) {
            // Create new css classes
            this.cssClassAdd(typePart, typeGlobal);
            // Replace full class name by shorten version.
            this.cssRewriteAll(typeCss, this.classSaved[typePart]);
            this.cssRewritten[typePart] = this.cssRewritten[typePart] || 0;
            this.cssRewritten[typePart]++;
            if (this.classLists[typeGlobal].indexOf(this.classSaved[typePart]) === -1) {
              // Add only class when css rules has been detected.
              this.classLists[typeGlobal].push(this.classSaved[typePart]);
            }
          }
          else {
            this.cssRewritten[typePart]--;
            if (this.cssRewritten[typePart] === 0) {
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
      this.cssSheetLoadQueue.push(domStyle);
    }
  });
}(WjsProto));
