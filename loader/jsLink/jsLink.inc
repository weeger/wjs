<?php

namespace Wjs\Loader;

use \Wjs\Loader;

/**
 * @package Wjs\Loader
 */
class JsLink extends Loader {
  function jsFiles($flush) {
    $files = array();
    foreach ($this->extensionsPushed as $package) {
      $files[] = $package['#data'];
    }
    if ($flush) {
      $this->extensionPushedFlush();
    }
    return $files;
  }
}
