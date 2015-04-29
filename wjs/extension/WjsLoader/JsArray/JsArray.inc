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
  function extensionPush($name, $options = array(), $value = NULL) {
    $value = $this->valuePush($name, $value);
    if (is_array($value)) {
      $array = array_values($value);
    }
    else {
      $array = WJS_ERR_PUSH_UNDEFINED_EXTENSION_NAME;
    }
    return parent::extensionPush($name, $options, $array);
  }
}
