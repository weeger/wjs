<?php

namespace Wjs\Loader;

use \Wjs\Loader;

class JsMethod extends jsScript {
  var $allowJsCache = TRUE;

  function extensionPush($name, $excludeRequire = FALSE, $value = NULL) {
    $value  = $value === NULL ? $this->extensions[$name] : $value;
    $output = parent::extensionPush($name, $excludeRequire, $value);
    // Add closure callback. It close parse process.
    $output['#data'] .= 'loader.methodAddedComplete(name,process);';
    return $output;
  }
}