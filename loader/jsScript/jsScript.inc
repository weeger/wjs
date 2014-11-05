<?php

namespace Wjs\Loader;

use \Wjs\Loader;

/**
 * Transmit an array to a JS object.
 */
class JsScript extends Loader {

  /**
   * Append object to the output array.
   */
  function extensionPush($name, $value, $excludeRequire = FALSE) {
    if (is_file($value)) {
      $value = file_get_contents($value);
    }
    $output          = parent::extensionPush($name, $value, $excludeRequire);
    $output['#data'] = 'var loader=this;var process=arguments[2];' . $output['#data'];
    return $output;
  }
}