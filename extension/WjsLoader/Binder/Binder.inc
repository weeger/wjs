<?php

namespace Wjs5\Loader;

use \Wjs5\Loader\WebCom;

class Binder extends WebCom {

}

namespace Wjs5\Loader\Binder;

class Extension extends \Wjs5\Loader\WebCom\Extension {
  // Do not use WebCom css links detection.
  var $requireCssLinks = FALSE;
  var $cssStyles;

  function push() {
    // Push as a webcom.
    parent::push();
    // CSS for binders is not a link, but is loaded and parsed.
    $pathCss = $this->w->filePathMinExists($this->serverPath . '/' . $this->extensionName . '.css', 'css');
    if (file_exists($pathCss)) {
      $this->cssStyles = file_get_contents($pathCss);
    }
  }

  function instance() {
    $instance = parent::instance();
    $instance['css'] = $this->cssStyles;
    return $instance;
  }
}
