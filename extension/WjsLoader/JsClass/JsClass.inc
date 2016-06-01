<?php

namespace Wjs5\Loader;

use \Wjs5\Loader\JsMethod;

/**
 * Transmit a javascript class object.
 */
class JsClass extends JsMethod {
  var $allowJsCache = TRUE;
}

namespace Wjs5\Loader\JsClass;

class Extension extends \Wjs5\Loader\JsMethod\Extension {

}
