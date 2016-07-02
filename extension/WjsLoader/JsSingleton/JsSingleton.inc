<?php

namespace Wjs5\Loader;

use \Wjs5\Loader\JsClass;

/**
 * Transmit a javascript singleton class.
 */
class JsSingleton extends JsClass {
  var $allowRequireJs = TRUE;
}

namespace Wjs5\Loader\JsSingleton;

class Extension extends \Wjs5\Loader\JsClass\Extension {

}
