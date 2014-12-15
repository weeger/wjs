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
  function extensionPush($name, $excludeRequire = FALSE, $value = NULL) {
    $value  = $value === NULL ? $this->extensions[$name] : $value;
    if (is_file($value)) {
      $value = file_get_contents($value);
      $this->wjs->jsParseRequire($this->type, $name, $value);
    }
    $output          = parent::extensionPush($name, $excludeRequire, $value);
    $output['#data'] = 'var loader=this,name=arguments[0],process=arguments[2];' . $output['#data'];
    return $output;
  }
}