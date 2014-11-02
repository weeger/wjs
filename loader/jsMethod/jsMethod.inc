<?php

namespace Wjs\Loader;

use \Wjs\Loader;

class JsMethod extends jsScript {
  function extensionPush($name, $value, $excludeRequire = FALSE) {
    $output = parent::extensionPush($name, $value, $excludeRequire);
    // Add closure callback. It close parse process.
    $output['#data'] .= 'this.methodAddedComplete(name,process);';
    return $output;
  }
}