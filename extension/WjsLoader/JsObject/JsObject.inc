<?php

namespace Wjs\Loader;

use \Wjs\Loader;

/**
 * Transmit an array to a JS object.
 */
class JsObject extends Loader {
  var $allowJsCache = TRUE;
  var $allowRequireJs = TRUE;
}
