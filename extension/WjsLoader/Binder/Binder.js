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
        domStyleAll: {},
        classSaved: {},
        classLists: {},
        cssClassCounter: 0,
        cssDomItems: {},
        cssRewritten: {},
        regReplaceSlashes: new RegExp('\\.', 'g')
      });
      this.wjs.loaders.WebComp.__construct.call(this);
    },

    /**
     * Create dom style objects and classes
     * for the specified binder.
     * @param binder
     * @param toggle
     * @returns {*}
     */
    cssInit: function (binder, toggle) {
      this.cssDomInit(binder, toggle);
      return this.cssClassInit(binder, toggle);
    },

    /**
     * Initialize binder according to all its
     * object classes dependencies.
     * @param binder
     * @param toggle
     */
    cssDomInit: function (binder, toggle) {
      var i = 0, lineage;
      // Get classes attached to element.
      lineage = this.wjs.inheritProperty(binder, 'type');
      for (; i < lineage.length; i++) {
        this.cssDomInitType(lineage[i], toggle);
      }
    },

    /**
     * Create a dom "style" element for the specified
     * binder type, if css data are stored into definition.
     * @param name
     * @param toggle
     */
    cssDomInitType: function (name, toggle) {
      // One CSS file per type, named with
      // the name of main object.
      var data = this.wjs.get(this.type, name),
        domStyle = this.domStyle;
      if (toggle) {
        this.cssDomItems[name] = this.cssDomItems[name] || 0;
        this.cssDomItems[name]++;
        // Create CSS for whole bundle if not exists.
        if (data && data.css && !domStyle[name]) {
          // Append new style tag
          domStyle[name] = this.wjs.document.createElement('style');
          // Place CSS into it.
          // Add client binder path to URLs, if no http://.
          domStyle[name].innerHTML = data.css.replace(new RegExp('(url\\(["\'])(?!http[s]*:\/\/)', 'g'), '$1' + data.client);
          // Append to head.
          this.wjs.document.head.appendChild(domStyle[name]);
        }
      }
      else {
        this.cssDomItems[name]--;
        if (this.cssDomItems[name] === 0 && domStyle[name]) {
          domStyle[name].parentNode.removeChild(domStyle[name]);
          delete domStyle[name];
        }
      }
    },

    cssClassInit: function (binder, toggle) {
      var i = 0,
        insideBinder = false,
        typeCss,
        typePart,
        lineage,
        lineagePart = [],
        typeGlobal = binder.typeGlobal;
      // Get classes attached to element.
      lineage = this.wjs.inheritProperty(binder, 'type');
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
      // Save full class for binder.
      binder.classGlobal = this.classSaved[typeGlobal];
      // Return list of used classes.
      return this.classLists[typeGlobal];
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
    }
  });
}(WjsProto));
