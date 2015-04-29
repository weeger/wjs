<?php

namespace Wjs\Loader;

use \Wjs\Loader;

define('WJS_PUSH_CSSLINK_INCLUDED', 'WJS_PUSH_CSSLINK_INCLUDED');

/**
 * @package Wjs\Loader
 */
class CssLink extends Loader {

  function extensionPush($name, $options = array(), $value = NULL) {
    $value = $this->valuePush($name, $value);
    if ($value !== WJS_ERR_PUSH_UNDEFINED_EXTENSION_NAME && is_array($value) && isset($value['client'])) {
      $value = $value['client'];
    }
    return parent::extensionPush($name, $options, $value);
  }

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
          // Remove into wjs registry.
        $this->wjs->outputPackage[$this->type][$name]['#data'] = WJS_PUSH_CSSLINK_INCLUDED;
      }
      // Return always server path.
      return $this->extensions[$name][$side];
    }
    return '';
  }
}
