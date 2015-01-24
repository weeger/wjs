<?php

namespace Wjs\Loader;

use \Wjs\Loader;

/**
 * Transmit an array to a JS array.
 */
class Image extends Loader {
  /**
   * Append object to the output array.
   */
  function extensionPush($name, $excludeRequire = FALSE, $value = NULL) {
    // There is no value for images, value = name = url.
    return parent::extensionPush($name, $excludeRequire, $name);
  }
}