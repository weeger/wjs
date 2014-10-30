<?php

namespace Wjs\Loader;

use \Wjs\Loader;

/**
 * Loader to load other wjsLoader loaders !
 */
class wjsLoader extends jsScript {
  function extensionPush($name, $value, $excludeRequire = FALSE) {
    $path = $value . $name . '.js';
    // wjsLoader value is always a folder path,
    // expecting that a js file inside it exists.
    return parent::extensionPush($name, is_file($path) ? $path : TRUE, $excludeRequire);
  }
}