<?php

namespace Wjs\Loader;

use \Wjs\Loader;

/**
 * Transmit an array to a JS array.
 */
class JsArray extends Loader {
  /**
   * Append object to the output array.
   */
  function extensionPush($name, $value, $excludeRequire = FALSE) {
    return parent::extensionPush($name, array_values($value), $excludeRequire);
  }
}