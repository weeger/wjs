(function (W) {
  'use strict';

  /**
   * Callback on click on w links.
   * @param {Event} e
   */
  var linkReg = new RegExp('^w://([a-zA-Z0-9]*):([a-zA-Z0-9]*)$'),
    linksClick = function (e) {
      // Points to current w.
      var self = this,
        link = e.target.getAttribute('data-w-link').match(linkReg);
      this.loadersExists([link[1]], function () {
        self.loaders[link[1]].link(link[2]);
      });
      return false;
    };

  /**
   * Detects links containing href with w://extensionType:extensionName
   * @param {Object} domElement
   */
  W.register('JsMethod', 'wjsHrefInit', function (dom) {
    // Search for html containing href="w://..."
    var wjsLinks = dom.querySelectorAll('a[href^="w://"]'),
      i = 0, href, disable = function () {
        return false;
      };
    for (; i < wjsLinks.length; i++) {
      href = wjsLinks[i].getAttribute('href');
      wjsLinks[i].setAttribute('href', 'javascript:void(0)');
      // Firefox need to disable onclick for some links.
      wjsLinks[i].onclick = disable;
      wjsLinks[i].setAttribute('data-w-link', href);
      wjsLinks[i].addEventListener('click', linksClick.bind(this));
    }
  });
}(W));
