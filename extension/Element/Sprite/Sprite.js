/**
 * - Sprites should have a stage to refer.
 * - Contain play / stop controllers.
 * @require Element > Stage
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('Element', 'Sprite', {

    variables: {
      name: ''
    },

    options: {
      children: {
        define: function (value, options) {
          // Ensure to load stage before loading children.
          this.optionApply('stage', options);
          // Ball base function.
          this.__base.apply(this, arguments);
        }
      },
      stage: {
        define: function (value, options) {
          if (!value) {
            this.optionApply('dom', options);
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
            // this.error('No stage defined (' + value + ')');
            value = this.wjs.loaders.Element.instance('Stage', {
              dom: this.wjs.document.body,
              playPlayer: true,
              autoPlay: true
            });
            // Stage can be not the parent if defined as an option,
            // but in this case sprite looks orphan.
            if (!options.parent) {
              value.elementAppend(this);
            }
          }
          this.stage =
            this.playPlayer = value;
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
