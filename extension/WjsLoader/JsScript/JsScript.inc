<?php

namespace Wjs\Loader;

use \Wjs\Loader;

/**
 * Transmit an array to a JS object.
 */
class JsScript extends Loader {
  var $allowJsCache = TRUE;

  /**
   * Append object to the output array.
   */
  function extensionPush($name, $excludeRequire = FALSE, $value = NULL) {
    $value = $this->valuePush($name, $value);
    if ($value !== WJS_ERR_PUSH_UNDEFINED_EXTENSION) {
      if (is_file($value)) {
        $value = file_get_contents($value);
        $this->wjs->jsParseRequire($this->type, $name, $value);
      }
      $output = parent::extensionPush($name, $excludeRequire, $value);
      if ($this->wjs->cacheEnabled === FALSE) {
        $output['#data'] = 'var loader=this,name=arguments[0],process=arguments[2];' . $output['#data'];
      }
      return $output;
    }
    else {
      return parent::extensionPush($name, $excludeRequire, $value);
    }
  }

  function cacheJsEncode($data) {
    // Wrap data into a function, so cached file
    // will be a pure javascript file with no eval.
    return 'function(loader,name,process){' . $data . '}';
  }
}