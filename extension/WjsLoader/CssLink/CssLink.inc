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
      $sidePath = $side . 'Path';
      // Avoid duplicates, it can occur when
      // loader have parent or dependencies.
      if (!in_array($this->extensions[$name]->$sidePath, $files)) {
        // Return path according asked side.
        return $this->extensions[$name]->$sidePath;
      }
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
    // TODO Unexpected behaviors when enabled
    // $output = !$this->w->ajaxRequest ? WJS5_PUSH_CSSLINK_INCLUDED : $this->clientPath;
    // There may be no value for css link, value = name = url.
    return parent::output($this->clientPath);
  }
}
