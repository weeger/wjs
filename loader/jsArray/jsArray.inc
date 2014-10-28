<?php

namespace Wjs\Loader;

use \Wjs\Loader;

/**
 * Transmit an array to a JS array.
 */
class jsArray extends Loader {
  /**
   * Append object to the output array.
   */
  function extensionPush($name, $value) {
    return parent::extensionPush($name, array_values($value));
  }
}