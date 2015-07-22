/**
 * Clips have a specific centered positioning system.
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('Binder', 'Clone', {
    options: {
      target: {
        required: true,
        define: function (com, value) {
          com.optionsData.target = {
            __variableSet: value.__variableSet,
            __variableGet: value.__variableGet
          };

          // TODO Faire les phases avant ?
          // TODO Le clone sera un objet intermédiaire pour pouvoir supporter tout les types
          // TODO Il devra s'adapter à toutes les propriétés de l'objet
          // - Variables (éviter les variables traîtées autrement ex plugins)
          // - Plugins
          // - States
          // - Options
          // - Phases

//          value.__variableSet = function() {
//            lo g(name + ' ' + value)
//          };

//          value.__variableGet = function(name) {
////            lo g('YO ' + name)
//            return com.optionsData.target.__variableGet.call(value,name);
//          };
        }
      }
    }
  });
}(WjsProto));
