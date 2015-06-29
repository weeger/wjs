/**
 * @require JsMethod > arrayDeleteByIndex
 */
(function (WjsProto) {
  'use strict';
  var inheritMethodCallback = function (object, method, passes, objectCurrentMethod) {
    return function () {
      // We rise pass level.
      passes[method] += 1;
      // We execute function.
      var output = objectCurrentMethod.apply(object, arguments);
      // We lower pass level.
      passes[method] -= 1;
      // The return output content.
      return output;
    };
  };

  /**
   * Call super method of the given object and method, searching for
   * multiple inheritance levels. This function creates a temporary
   * variable called "_inheritMethodBases", to inspect whole inheritance lineage.
   * It will be deleted at the end of inspection.
   *
   * @param {object} object The owner object of the method and inheritance lineage
   * @param {string} method The name of the super method to find.
   * @param {object} args The calls arguments, basically use the "arguments" special variable.
   * @returns {*} The data returned from the super method.
   */
  WjsProto.register('JsMethod', 'inheritMethod', function (object, method, args) {
    // We create an object to keep reference to "base" object,
    // it will be replaced during lineage exploration to always keep
    // direct parent object. We use a object to save multiple references
    // if various inheritMethod are launched for different methods.
    if (!object.hasOwnProperty('_inheritMethodBases')) {
      object._inheritMethodBases = {};
      object._inheritMethodPass = {};
    }
    // Create shortcuts.
    var passes = object._inheritMethodPass,
      bases = object._inheritMethodBases,
    // Get pass level in case of recursive calls.
      passIndex = passes[method] !== undefined ? passes[method] : 0,
    // We get base object, first time it will be passed object,
    // but in case of multiple inheritance, it will be instance of parents objects.
      base = bases.hasOwnProperty(method) && bases[method].hasOwnProperty(passIndex) ? bases[method][passIndex][bases[method][passIndex].length - 1] : object,
    // We get matching method, from current object,
    // this is a reference to define super method.
      objectCurrentMethod = base[method],
    // Temp object wo receive method definition.
      descriptor = null,
    // We define super function after founding current position.
      isSuper = false,
    // Contain output data.
      output = null,
      done = false;
    // Iterates over the base prototypes chain.
    while (base !== null && done !== true) {
      // Get method info
      descriptor = Object.getOwnPropertyDescriptor(base, method);
      if (descriptor) {
        // We search for current object method to define inherited part of chain.
        if (descriptor.value === objectCurrentMethod) {
          // Further loops will be considered as inherited function.
          isSuper = true;
        }
        // We already have found current object method.
        else if (isSuper === true) {
          // We need to pass original object to apply() as first argument,
          // this allow to keep original instance definition along all method
          // inheritance. But we also need to save reference to "base" who to
          // contain parent class, it will be used into this function startup
          // begin at the right chain position. First we create method entry.
          if (!bases[method]) {
            passes[method] = 0;
            bases[method] = [];
          }
          // Then we create pass entry.
          if (!bases[method][passIndex]) {
            bases[method][passIndex] = [];
          }
          // We store base object.
          bases[method][passIndex].push(base);
          // We replace own method by a launcher who manage internal iteration.
          object[method] = inheritMethodCallback(object, method, passes, objectCurrentMethod);
          // Apply super method.
          output = descriptor.value.apply(object, args);
          // Return to original function.
          object[method] = objectCurrentMethod;
          // Property have been used into super function if another
          // inheritMethod() is launched. Reference is not useful anymore.
          bases[method][passIndex].pop();
          // Cleanup array.
          if (!bases[method][passIndex].length) {
            this.arrayDeleteByIndex(bases[method], passIndex);
          }
          // Delete empty array.
          if (!bases[method].length) {
            delete bases[method];
            delete passes[method];
          }
          // Job is done.
          done = true;
        }
      }
      // Iterate to the next parent inherited.
      base = Object.getPrototypeOf(base);
    }
    // Cleanup temp variable.
    if (!Object.keys(bases).length) {
      delete object._inheritMethodBases;
      delete object._inheritMethodPass;
    }
    // Return retrieved content.
    if (done) {
      return output;
    }
  });
}(WjsProto));
