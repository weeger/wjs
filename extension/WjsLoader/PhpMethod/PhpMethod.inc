<?php

namespace Wjs\Loader;

use \Wjs5\Loader;

/**
 * @package Wjs\Loader
 */
class PhpMethod extends Loader {

  function extensionPush($name, $options = array(), $value = NULL) {
    $value = $this->valuePush($name, $value);
    if (!$this->valueIsError($value)) {
      // Data should be Php file path.
      require_once $this->valuePush($name, $value);
    }
    // Do not push anything to client.
    return WJS_PUSH_HIDDEN_EXTENSION;
  }

  function scanFolderItem($directory, $item, $globalData) {
    if (is_file($directory . $item)) {
      $info = pathinfo($directory . $item);
      // Select .inc files
      if ($info['extension'] === 'inc') {
        $this->wjs->extensionAdd($this->type, $info['filename'], $directory . $item);
      }
    }
  }
}
