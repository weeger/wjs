<?php

namespace Wjs5\Loader;

require_once 'WjsLibrary.class.inc';

use \Wjs5\Loader;

/**
 * @package Wjs\Loader
 */
class WjsLibrary extends WebCom {
  var $allowRequireJs = TRUE;

  /**
   * Register WebCom from a folder content.
   */
  function scanFolderItem($directory, $item, $globalData) {
    // Resolve path to support symlinks.
    if (is_dir(realpath($directory) . '/' . $item)) {
      $this->w->extensionAdd($this->type, $item, $directory . $item . '/');
    }
  }
}

namespace Wjs5\Loader\WjsLibrary;

class Extension extends \Wjs5\Loader\WebCom\Extension {
  var $classFile;
  var $className;

  function add($settings) {
    parent::add($settings);
    $this->classFile = $this->serverPath . $this->extensionName . '.inc';
    $this->className = '\\Wjs5\\Loader\\WjsLibrary\\' . $this->extensionName;
  }

  function instance($options) {
    require_once $this->classFile;
    return new $this->className($options);
  }
}
