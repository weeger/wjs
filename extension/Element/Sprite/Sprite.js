/**
 * - Sprites should have a stage to refer.
 * - Contain play / stop controllers.
 * @require Element > Stage
 */
(function (W) {
  'use strict';
  W.register('Element', 'Sprite', {

    variables: {
      name: '',
      autoPlay: false
    },

    options: {
      parent: {
        define: function (com, value, options) {
          // Ensure to load stage before.
          com.optionApply('stage', options);
          if (com.stage && !value) {
            value = com.stage;
          }
          // Call base function.
          return this.__super('define', [com, value, options]);
        }
      },
      children: {
        define: function (com, value, options) {
          // Ensure to load stage before loading children.
          com.optionApplyMultiple(['stage', 'parent'], options);
          // Call base function.
          return this.__super('define', arguments);
        }
      },
      stage: {
        define: function (com, value, options) {
          com.optionApply('dom', options);
          // Search into parent
          if (!value && options.parent) {
            // Parent is a stage.
            if (options.parent.isA('Stage')) {
              value = options.parent;
            }
            // Parent has a stage.
            else if (options.parent.stage && options.parent.stage.isA('Stage')) {
              value = options.parent.stage;
            }
          }
          if (!value || typeof value !== 'object' || !value.isA('Stage')) {
            // If dom destination is specified use it as stage container,
            value = this.wjs.loaders.Element.stageDefaultCreate(options.domDestination);
            // Use stage as new dom destination.
            options.domDestination = value.dom;
            // Stage can be not the parent if defined as an option,
            // but in this case sprite looks orphan.
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
}(W));
