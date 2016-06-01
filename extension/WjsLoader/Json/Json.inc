<?php

namespace Wjs5\Loader;

use \Wjs5\Loader\JsObject;

/**
 * Transmit json to JS object.
 */
class Json extends JsObject {

  function scanFolderItem($directory, $item, $globalData) {
    if (is_file($directory . $item)) {
      // Get file info.
      $info = pathinfo($directory . $item);
      // Add data.
      $this->w->extensionAdd($this->type, $info['filename'], $directory . $item);
    }
  }
}

namespace Wjs5\Loader\Json;

class Extension extends \Wjs5\Extension {
  var $content;

  /**
   * Append object to the output array.
   *
   * @param $settings
   */
  function add($settings) {
    $this->content = (is_file($settings)) ? json_decode(file_get_contents($settings)) : $settings;
  }

  function output($data = NULL) {
    return parent::output($this->content);
  }
}

