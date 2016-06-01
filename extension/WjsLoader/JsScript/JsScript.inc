<?php

namespace Wjs5\Loader;

use \Wjs5\Loader;

/**
 * Transmit an array to a JS object.
 */
class JsScript extends Loader {
  var $allowJsCache = TRUE;
  var $allowRequireJs = TRUE;

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
        return $this->w->extensionAdd($this->type, $info['filename'], array(
          // Return good version
          'serverPath' => $this->w->jsFileVersioned($directory . $item)
        ));
      }
    }
  }
}

namespace Wjs5\Loader\JsScript;

class Extension extends \Wjs5\Extension {
  var $serverPath;
  var $script;

  function add($settings) {
    $serverPath = $settings;
    if (is_array($settings) && isset($settings['serverPath'])) {
      $serverPath = $settings['serverPath'];
    }
    if (is_file($serverPath)) {
      $this->serverPath = $serverPath;
    }
    else {
      $this->script = $settings;
    }
  }

  function push() {
    // Script has not been initialized with inline data.
    if (!$this->script) {
      // Load file content.
      $this->script = file_get_contents($this->serverPath);
    }
    // Search dependencies.
    $this->w->jsParseRequire($this->extensionType, $this->extensionName, $this->script);
  }

  function output($data = NULL) {
    return parent::output($this->script);
  }
}
