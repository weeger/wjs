<?php

namespace wjs\loader;

/**
 * Class json
 * Transmit json data to wjs.
 * @package wjs\loader
 */
class json extends \wjs\loader\javascript {
  var $inc = __FILE__;

  function output_append($name, $path = FALSE, $package = array()) {
    // Use same behavior as parent class.
    $path = ($path === FALSE) ? $this->items[$name] : $path;
    if (!is_file($path)) {
      return 'JSON file not found : ' . $path;
    }
    // We specify data type
    return $this->javascript_file_pack($path, 'json');
  }

  function output_wrap($script) {
    // Decode content to merge it with output json.
    // In other case, content will be transmitted as a string.
    return json_decode($script);
  }
}
