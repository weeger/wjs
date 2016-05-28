<?php

namespace Wjs\Loader;

use \Wjs5\Loader;

class Audio extends Loader {
  var $allowRequireJs = TRUE;
  /**
   * Append object to the output array.
   */
  function extensionPush($name, $options = array(), $value = NULL) {
    // There is no value for audio, value = name = url.
    return parent::extensionPush($name, $options, $name);
  }
}
