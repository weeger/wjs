<?php

namespace Wjs5\Loader;

use \Wjs5\Loader;

define('WJS5_PUSH_CSSLINK_INCLUDED', 'WJS5_PUSH_CSSLINK_INCLUDED');

/**
 * @package Wjs5\Loader
 */
class CssLink extends Loader {
  var $allowRequireJs = TRUE;

  /**
   * On head render process, give list of js files
   * to page head, and disable pushed scripts,
   */
  function headerFilesExtension($type, &$files, $side, $render = FALSE, $name) {
    if ($type === 'css') {
      // Remove pushed data on render.
      if ($render) {
        // Remove internally.
        $this->extensionsPushed[$name]['#data'] =
          // Remove into w registry.
        $this->w->outputPackage[$this->type][$name]['#data'] = WJS5_PUSH_CSSLINK_INCLUDED;
      }
      // Return always server path.
      return $this->extensions[$name][$side];
    }
    return '';
  }
}

namespace Wjs5\Loader\CssLink;

class Extension extends \Wjs5\Extension {
  var $clientPath;

  function add($settings) {
    $this->clientPath = is_array($settings) && isset($settings['clientPath']) ? $settings['clientPath'] : $settings;
  }

  /**
   * Append object to the output array.
   */
  function output($data = NULL) {
    // There is no value for css link, value = name = url.
    return parent::output($this->clientPath);
  }
}
