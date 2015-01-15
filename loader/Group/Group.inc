<?php

namespace Wjs\Loader;

use \Wjs\Loader;

/**
 * @package Wjs\Loader
 */
class Group extends Loader {
  function extensionPush($name, $excludeRequire = FALSE, $value = NULL) {
    $value = $this->valuePush($name, $value);
    if ($value !== WJS_ERR_PUSH_UNDEFINED_EXTENSION) {
      // Values are just requirements.
      foreach ($value as $group => $items) {
        foreach ($items as $item) {
          $this->wjs->extensionAddRequire($this->type, $name, $group, $item);
        }
      }
      // Save value as true.
      $value = TRUE;
    }
    return parent::extensionPush($name, $excludeRequire, $value);
  }
}
