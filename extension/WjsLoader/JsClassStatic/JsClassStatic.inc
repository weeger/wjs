<?php

// TODO Rename to JsSingleton

namespace Wjs5\Loader;

use \Wjs5\Loader\JsClass;

/**
 * Transmit a javascript singleton class.
 */
class JsClassStatic extends JsClass {
  var $allowRequireJs = TRUE;
}

namespace Wjs5\Loader\JsClassStatic;

class Extension extends \Wjs5\Loader\JsClass\Extension {

}
