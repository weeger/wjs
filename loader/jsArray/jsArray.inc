<?php

namespace Wjs\Loader;

use \Wjs\Loader;

/**
 * Transmit an array to a JS array.
 */
class JsArray extends Loader {
  var $allowJsCache = TRUE;
  /**
   * Append object to the output array.
   */
  function extensionPush($name, $excludeRequire = FALSE, $value = NULL) {
    $value  = $value === NULL ? $this->extensions[$name] : $value;
    if (is_array($value)) {
      return parent::extensionPush($name, $excludeRequire, array_values($value));
    }
    return WJS_ERR_PUSH_WRONG_DATA_TYPE;
  }
}