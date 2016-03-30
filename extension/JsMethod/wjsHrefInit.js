(function (WjsProto) {
  'use strict';

  /**
   * Callback on click on wjs links.
   * @param {Event} e
   */
  var linkReg = new RegExp('^wjs://([a-zA-Z0-9]*):([a-zA-Z0-9]*)$'),
    linksClick = function (e) {
      // Points to current wjs.
      var self = this,
        link = e.target.getAttribute('data-wjs-link').match(linkReg);
      this.loadersExists([link[1]], function () {
        self.loaders[link[1]].link(link[2]);
      });
      return false;
    };

  /**
   * Detects links containing href with wjs://extensionType:extensionName
   * @param {Object} domElement
   */
  WjsProto.register('JsMethod', 'wjsHrefInit', function (dom) {
    // Search for html containing href="wjs://..."
    var wjsLinks = dom.querySelectorAll('a[href^="wjs://"]'),
      i = 0, href, disable = function () {
        return false;
      };
    for (; i < wjsLinks.length; i++) {
      href = wjsLinks[i].getAttribute('href');
      wjsLinks[i].setAttribute('href', 'javascript:void(0)');
      // Firefox need to disable onclick for some links.
      wjsLinks[i].onclick = disable;
      wjsLinks[i].setAttribute('data-wjs-link', href);
      wjsLinks[i].addEventListener('click', linksClick.bind(this));
    }
  });
}(WjsProto));
