/**
 */
(function (WjsProto) {
  'use strict';
  /**
   * Here is the main function of the full site navigation management.
   */
  WjsProto.register('WebComp', 'PrevNext', {

    /**
     * @require JsMethod > domId
     */
    init: function () {
      this.domPrev = this.wjs.domId('previous');
      this.domNext = this.wjs.domId('next');
      // Apply a custom function for button.
      this.domPrev.onclick = this.domNext.onclick = this.eventButtonClick.bind(this);
    },

    /**
     * Handle click on prev / next buttons.
     * @param e
     */
    eventButtonClick: function (e) {
      this.wjs.loaders.DemoPage.pageChange(e.target.getAttribute('id'));
    }
  });
  // [-->
}(WjsProto));
