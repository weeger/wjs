<?php

namespace Wjs\Loader;

use \Wjs\Loader;

/**
 * Transmit an array to a JS object.
 */
class jsScript extends Loader {

  /**
   * Append object to the output array.
   */
  function extensionPush($name, $value, $excludeRequire = FALSE) {
    if (is_file($value)) {
      $value = file_get_contents($value);
    }
    return parent::extensionPush($name, $value, $excludeRequire);
  }
}