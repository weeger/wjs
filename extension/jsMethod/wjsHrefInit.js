(function (WjsProto) {
  'use strict';
  /**
   * Detects links containing href with wjs://
   */
  WjsProto.register('JsMethod', 'wjsHrefInit', function () {
//    __construct: function () {
//      this.linksInit(this.wjs.document.body);
//      this.linkReg = new RegExp('^wjs://([a-zA-Z0-9]*):([a-zA-Z0-9]*)$');
//    },
//
//    /**
//     * Search for links like wjs://extensionType:extensionName
//     * @param {Object} domElement
//     */
//    linksInit: function (domElement) {
//      // Search for html containing href="wjs://..."
//      var wjsLinks = domElement.querySelectorAll('a[href^="wjs://"]'),
//        i = 0, href, disable = function () {
//          return false;
//        };
//      for (; i < wjsLinks.length; i++) {
//        href = wjsLinks[i].getAttribute('href');
//        wjsLinks[i].setAttribute('href', '#');
//        // Firefox need to disable onclick for some links.
//        wjsLinks[i].onclick = disable;
//        wjsLinks[i].setAttribute('data-wjs-link', href);
//        wjsLinks[i].addEventListener('click', this.linksClick.bind(this));
//      }
//    },
//
//    /**
//     * Callback on click on wjs links.
//     * @param {Event} e
//     */
//    linksClick: function (e) {
//      var wjs = this.wjs,
//        link = e.target.getAttribute('data-wjs-link').match(this.linkReg);
//      wjs.loadersExists([link[1]], function () {
//        wjs.loaders[link[1]].link(link[2]);
//      });
//      return false;
//    }
  });
}(WjsProto));
