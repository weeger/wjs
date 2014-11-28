<?php

namespace Wjs\Loader;

use \Wjs\Loader;

/**
 * @package Wjs\Loader
 */
class Group extends Loader {
  function extensionPush($name, $excludeRequire = FALSE, $value = NULL) {
    $value = $value === NULL ? $this->extensions[$name] : $value;
    // Values are just requirements.
    foreach ($value as $group => $items) {
      foreach ($items as $item) {
        $this->wjs->extensionAddRequire($this->type, $name, $group, $item);
      }
    }
    // Save value as true.
    return parent::extensionPush($name, $excludeRequire, TRUE);
  }
}
