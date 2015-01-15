<?php

namespace Wjs\Loader;

use \Wjs\Loader;

class JsMethod extends JsScript {
  var $allowJsCache = TRUE;

  function extensionPush($name, $excludeRequire = FALSE, $value = NULL) {
    $value  = $this->valuePush($name, $value);
    $output = parent::extensionPush($name, $excludeRequire, $value);
    if ($output['#data'] !== WJS_ERR_PUSH_UNDEFINED_EXTENSION) {
      // Add closure callback. It close parse process.
      $output['#data'] .= 'loader.loadComplete' . $this->type . '(name,process);';
    }
    return $output;
  }
}