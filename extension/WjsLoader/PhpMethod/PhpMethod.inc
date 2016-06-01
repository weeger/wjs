<?php

namespace Wjs5\Loader;

use \Wjs5\Loader;

/**
 * @package Wjs5\Loader
 */
class PhpMethod extends Loader {
  function scanFolderItem($directory, $item, $globalData) {
    if (is_file($directory . $item)) {
      $info = pathinfo($directory . $item);
      // Select .inc files
      if ($info['extension'] === 'inc') {
        $this->w->extensionAdd($this->type, $info['filename'], $directory . $item);
      }
    }
  }
}

namespace Wjs5\Loader\PhpMethod;

class Extension extends \Wjs5\Extension {
  var $serverPath;

  /**
   * Append object to the output array.
   */
  function add($settings) {
    $this->serverPath = $settings;
    // Data should be Php file path.
    require_once $this->serverPath;
  }

  function output($data = NULL) {
    // Do not push anything to client.
    return WJS5_PUSH_HIDDEN_EXTENSION;
  }
}

