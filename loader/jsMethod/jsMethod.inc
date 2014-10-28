<?php

namespace Wjs\Loader;

use \Wjs\Loader;

class jsMethod extends jsScript {
  function extensionPush($name, $value) {
    $output = parent::extensionPush($name, $value);
    // Add closure callback. It close parse process.
    $output['#data'] .= 'this.methodAddedComplete(name,process);';
    return $output;
  }
}