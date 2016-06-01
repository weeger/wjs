<?php

namespace Wjs5\Loader;

use \Wjs5\Loader;

class File extends Loader {
  function extensionGetMissing($extensionName) {
    // Asking for a file will add it.
    $this->w->extensionAdd($this->type, $extensionName, array());
  }
}

namespace Wjs5\Loader\File;

class Extension extends \Wjs5\Extension {
  /**
   * Append object to the output array.
   */
  function output($data = NULL) {
    // There is no value for files, value = name = url.
    return parent::output($this->extensionName);
  }
}
