<?php

namespace Wjs5\Loader;

use \Wjs5\Loader;

/**
 * Transmit an array to a JS array.
 */
class JsArray extends Loader {
  var $allowJsCache = TRUE;
  var $allowRequireJs = TRUE;
  /**
   * Append object to the output array.
   */
  function extensionPush($name, $options = array(), $value = NULL) {
    $value = $this->valuePush($name, $value);
    if (is_array($value)) {
      $array = array_values($value);
    }
    else {
      $array = WJS5_ERR_PUSH_UNDEFINED_EXTENSION_NAME;
    }
    return parent::extensionPush($name, $options, $array);
  }
}
