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
      // Get list of @require function.
      // Search for all "@require type > name" into script and add it to the output array.
      preg_match_all("`@require\\s(.*)\\s>\\s(.*)\\s`", $value, $results);
      foreach ($results[0] as $key => $item) {
        $this->wjs->extensionAddRequire($this->type, $name, $results[1][$key], $results[2][$key]);
      }
    }
    $output          = parent::extensionPush($name, $excludeRequire, $value);
    $output['#data'] = 'var loader=this,name=arguments[0],process=arguments[2];' . $output['#data'];
    return $output;
  }
}