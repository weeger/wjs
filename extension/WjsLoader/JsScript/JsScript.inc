<?php

namespace Wjs5\Loader;

use \Wjs5\Loader;

/**
 * Transmit an array to a JS object.
 */
class JsScript extends Loader {
  var $allowJsCache = TRUE;
  var $allowRequireJs = TRUE;
  /**
   * Append object to the output array.
   */
  function extensionPush($name, $options = array(), $value = NULL) {
    $value = $this->valuePush($name, $value);
    if ($value !== WJS5_ERR_PUSH_UNDEFINED_EXTENSION_NAME) {
      if (is_file($value)) {
        $value = file_get_contents($value);
        $this->wjs->jsParseRequire($this->type, $name, $value);
      }
      $output = parent::extensionPush($name, $options, $value);
      return $output;
    }
    return parent::extensionPush($name, $options, $value);
  }

  function cacheJsEncode($data) {
    // Wrap data into a function, so cached file
    // will be a pure javascript file with no eval.
    return 'function(){' . $data . '}';
  }

  function scanFolderItem($directory, $item, $globalData) {
    if (is_file($directory . $item)) {
      $info = pathinfo($directory . $item);
      // Avoid minified files.
      if (substr($info['filename'], -4) !== '.min') {
        $this->wjs->extensionAdd($this->type, $info['filename'],
          // Return good version
          $this->wjs->jsFileVersioned($directory . $item));
      }
    }
  }
}
