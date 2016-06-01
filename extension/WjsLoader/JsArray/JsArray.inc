<?php

namespace Wjs5\Loader;

use \Wjs5\Loader\JsObject;

/**
 * Transmit an array to a JS array.
 */
class JsArray extends JsObject {
  var $allowJsCache = TRUE;
  var $allowRequireJs = TRUE;
}

namespace Wjs5\Loader\JsArray;

class Extension extends \Wjs5\Loader\JsObject\Extension {
  function add($settings) {
    // Transform keys as indexes.
    parent::add(array_values($settings));
  }
}
