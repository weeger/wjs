/**
 * @require JsMethod > eventKeyCode
 * @require JsMethod > eventTransitionName
 * @require JsMethod > domId
 */
(function (WjsProto) {
  'use strict';
  /**
   * Here is the main function of the full site navigation management.
   */
  WjsProto.register('WjsLoader', 'DemoPage', {
    loaderExtends: 'WebPage',

    /**
     * Hook called at loader creation,
     * we save references to page dom objects,
     * and initialize buttons.
     */
    __construct: function () {
      var wjs = this.wjs, domId = wjs.domId;
      wjs.loaders.WebPage.__construct.apply(this);
      // We create internal references to page objects.
      this.wjs.extendObject(this, {
        domMain: domId('main'),
        domLoading: domId('loading'),
        domMainContent: domId('main-content'),
        domMessage: domId('message'),
        domButtons: {
          previous: domId('previous'),
          next: domId('next')
        }
      });
      // Apply a custom function for button.
      this.domButtons.previous.onclick =
        this.domButtons.next.onclick = this.eventButtonClick.bind(this);
      // Key press handler.
      wjs.window.addEventListener('keydown', this.eventKeydown.bind(this));
      // Menu is not present by default.
      this.domMenu = false;
    },

    link: function (name, e) {
      this.pageShow(name);
    },

    /**
     * Hook called when an extension is loaded,
     * we init the loaded page with some variables.
     * @param name
     * @param value
     * @param process
     * @returns {*|number}
     */
    parse: function (name, value, process) {
      // Execute WebComp base functions
      var output = this.wjs.loaders.WebComp.parse.apply(this, [name, value, process]);
      // Display page.
      this.pageShowParse(name, value);
      // Return normal output.
      return output;
    },

    /**
     * Manage buttons toggle
     * @param name
     */
    buttonInit: function (name) {
      var classList = this.domButtons[name].classList;
      if (this.pageData[name]) {
        classList.remove('disabled');
      }
      else {
        classList.add('disabled');
      }
    },

    /**
     * Change page using previous / next keywords.
     * @param direction
     * @returns {boolean}
     */
    pageChange: function (direction) {
      if (!this.domButtons[direction].classList.contains('disabled')) {
        // Destroy current page from memory,
        // this launch de destroy hook.
        this.pageHide(this.pageData[direction]);
      }
      else {
        return false;
      }
    },

    /**
     * Initialize extra web components link GitHub ribbon
     * and left menu : if GitHub = true, we load extension,
     * but only if it is missing. This behavior is different
     * that normal dependencies management, which will reload
     * and destroy extra extensions each time.
     * @param name
     */
    webCompInit: function (name) {
      var toggleName = name + 'Opened', wjs = this.wjs;
      if (this.pageData[name] && !this[toggleName]) {
        this[toggleName] = true;
        wjs.use('WebComp', name);
      }
      else if (!this.pageData[name] && this[toggleName]) {
        wjs.destroy('WebComp', name, true);
        this[toggleName] = false;
      }
    },

    /**
     * Display loaded page, launch load animations.
     * @returns {boolean}
     */
    pageShow: function (name) {
      if (this.pageCurrent) {
        this.pageHide(name);
        return;
      }
      this.wjs.use('DemoPage', name);
    },

    pageShowParse: function (name, value) {
      // Save internally.
      this.pageCurrent = name;
      this.pageData = value;
      // Hide loading page.
      this.domLoading.style.display = 'none';
      // Init navigation
      this.buttonInit('previous');
      this.buttonInit('next');
      this.domMessage.classList.add('fadein');
      this.webCompInit('Menu');
      this.webCompInit('GitHub');
    },

    /**
     * Hide page.
     * @param replacement
     */
    pageHide: function (replacement, replacementValue) {
      // Prevent multiple loads.
      if (!this.pageHideStarted) {
        this.pageHideStarted = true;
        this.domLoading.style.display = '';
        var self = this,
          domMain = this.domMain,
          domMessage = this.domMessage,
          pageCurrent = this.pageCurrent,
          transitionEvent = this.wjs.eventTransitionName(),
          callback = function (e) {
            self.pageHideStarted = false;
            self.pageCurrent = false;
            domMain.classList.remove('unload');
            domMessage.removeEventListener(transitionEvent, callback);
            self.wjs.destroy('DemoPage', pageCurrent, {
              dependencies: true,
              complete: function () {
                self.pageShow(replacement, replacementValue);
              }
            });
          };
        domMessage.addEventListener(transitionEvent, callback, false);
        this.domMain.classList.add('unload');
        this.domMessage.classList.remove('fadein');
        this.domMessage.classList.remove('fadeout');
        self.domMessage.classList.add('fadeout');
      }
    },

    /**
     * Handle click on prev / next buttons.
     * @param e
     */
    eventButtonClick: function (e) {
      this.pageChange(e.target.getAttribute('id'));
    },

    /**
     * Manage keyboard keys for navigation.
     * @param e
     */
    eventKeydown: function (e) {
      switch (this.wjs.eventKeyCode(e)) {
        // Left arrow
        case 37 :
          this.pageChange('previous');
          break;
        // Right arrow
        case 39 :
          this.pageChange('next');
          break;
      }
    }
  });
  // [-->
}(WjsProto));
