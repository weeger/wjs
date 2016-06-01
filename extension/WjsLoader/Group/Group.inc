<?php

namespace Wjs5\Loader;

use \Wjs5\Loader;

/**
 * @package Wjs5\Loader
 */
class Group extends Loader {
  var $allowRequireJs = TRUE;
}

namespace Wjs5\Loader\Group;

class Extension extends \Wjs5\Extension {
  function add($settings) {
    // Values are just requirements.
    foreach ($settings as $group => $items) {
      foreach ($items as $item) {
        $this->w->extensionAddRequire($this->extensionType, $this->extensionName, $group, $item);
      }
    }
  }
}
