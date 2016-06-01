<?php

namespace Wjs5\Loader;

use \Wjs5\Loader;

/**
 * Transmit an array to a JS object.
 */
class JsObject extends Loader {
  var $allowJsCache = TRUE;
  var $allowRequireJs = TRUE;
}

namespace Wjs5\Loader\JsObject;

class Extension extends \Wjs5\Extension {
  var $array;

  function add($settings) {
    $this->array = $settings;
  }

  function output($data = NULL) {
    return parent::output($data ? $data : $this->array);
  }
}
