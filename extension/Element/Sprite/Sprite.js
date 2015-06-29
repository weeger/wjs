/**
 * - Sprites should have a stage to refer.
 * - Contain play / stop controllers.
 * @require Element > Stage
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('Element', 'Sprite', {

    variables: {
      name: '',
      autoPlay:false
    },

    options: {
      parent: {
        define: function (com, value, options) {
          // Ensure to load stage before.
          com.optionApply('stage', options);
          if (com.stage && !value) {
            value = com.stage;
          }
          // Ball base function.
          this.wjs.inheritMethod(this, 'define', [com, value, options]);
        }
      },
      children: {
        define: function (com, value, options) {
          // Ensure to load stage before loading children.
          com.optionApply('stage', options);
          // Ball base function.
          this.wjs.inheritMethod(this, 'define', arguments);
        }
      },
      stage: {
        define: function (com, value, options) {
          if (!value) {
            com.optionApply('dom', options);
            // Search from parent
            if (options.parent) {
              // Parent is a stage.
              if (options.parent.isA('Stage')) {
                value = options.parent;
              }
              // Parent has a stage.
              else if (options.parent.stage && options.parent.stage.isA('Stage')) {
                value = options.parent.stage;
              }
            }
          }
          if (typeof value !== 'object' || !value || !value.isA('Stage')) {
            value = com.wjs.loaders.Element.instance('Stage', {
              dom: com.wjs.document.body,
              playPlayer: true,
              autoPlay: true
            });
            // Stage can be not the parent if defined as an option,
            // but in com case sprite looks orphan.
            if (!options.parent) {
              value.elementAppend(com);
            }
          }
          com.stage = options.playPlayer = value;
        }
      },
      // Sprite name is for creator usage,
      // it is not unique.
      name: {
        defaults: 'Sprite'
      },
      parentShortcut: {
        defaults: null
      }
    }
  });
}(WjsProto));
