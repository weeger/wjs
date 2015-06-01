(function (WjsProto) {
  'use strict';
  /**
   * @require Plugin > Stage3d
   * @require Plugin > Clip3dContainerChild
   */
  WjsProto.register('Plugin', 'Clip3dContainer', {

    options: {
      radius: 100,
      pluginChild: 'Clip3dContainerChild'
    },

    required: [
      {type: 'Clip3d'}
    ],

    pluginInit: function () {
      this.wjs.inheritMethod(this, 'pluginInit', arguments);
      // We use dedicated plugin which do not so much thinks
      // except requiring another standard Clip3d plugin, avoiding duplications.
      this.pluginClip3dContainerChild = this.wjs.loaders.Plugin.instance(this.pluginChild, {
        pluginParent: this
      });
      this.pluginClip3dContainerChild.pluginParent = this;
    },

    binderInit: function (binder) {
      this.wjs.inheritMethod(this, 'binderInit', arguments);
      if (!this.stage3dPlugin) {
        this.stage3dPlugin = binder.stage.pluginAdd('Stage3d');
      }
    },

    overrides: {
      variables: {
        perspective: 1000
      },

      methods: {

        globalChildAppend: function (element, plugin) {
          element.pluginAdd(plugin.pluginClip3dContainerChild);
          element.object3d.parent = this.object3d;
          this.stage.child3dSort.push(element);
          return this.__base(element);
        },

        /**
         * @require JsMethod > arrayDeleteItem
         */
        globalChildRemove: function (element, plugin) {
          // In case of exit, plugin have already been removed.
          if (element.plugins[plugin.type]) {
            element.pluginRemove(plugin.pluginClip3dContainerChild);
          }
          this.wjs.arrayDeleteItem(this.stage.child3dSort, element);
          return this.__base(element);
        },

        renderDomMatrix: function () {
          // Overrides base Clip3d method.
          this.object3d.updateMatrixWorld();
          // IE wants perspective to be remembered...
          this.dom.style.perspective = this.perspective + 'px';
        },

        render: function () {
          this.stage.cameraWorldPosition = this.stage.camera.getWorldPosition();
          this.__base();
          this.stage.renderSortZ();
        }
      }
    }
  });
}(WjsProto));
