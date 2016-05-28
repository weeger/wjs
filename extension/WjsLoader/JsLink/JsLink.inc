<?php

namespace Wjs\Loader;

use \Wjs5\Loader;

define('WJS_PUSH_JSLINK_INCLUDED', 'WJS_PUSH_JSLINK_INCLUDED');

/**
 * @package Wjs\Loader
 */
class JsLink extends Loader {
  var $allowRequireJs = TRUE;

  function extensionAdd($name, $value) {
    $value = $value ? $value : realpath($name);
    if (is_string($value)) {
      $value = array('server' => $value);
    }
    if (is_array($value) && !isset($value['client'])) {
      $value['client'] = $this->wjs->pathClient(realpath($value['server']));
    }
    // Use minified files for master versions.
    if ($this->wjs->subversion !== 'source' && isset($value['server'])) {
      // Get minified path.
      $minJs = $this->wjs->filePathMin($value['server'], 'js');
      // Minified file must exists.
      if (is_file($minJs)) {
        $value['server'] = $minJs;
        // Minify also client path.
        if (isset($value['client'])) {
          $value['client'] = $this->wjs->filePathMin($value['client'], 'js');
        }
      }
    }
    parent::extensionAdd($name, $value);
    // Try to load file content,
    // and search for @require declarations.
    if (is_array($value) && is_string($value['server']) && is_file($value['server'])) {
      $this->wjs->jsParseRequire($this->type, $name, file_get_contents($value['server']));
    }
  }

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
    if ($type === 'js') {
      // Remove pushed data on render.
      if ($render) {
        // Remove internally.
        $this->extensionsPushed[$name]['#data'] =
          // Remove into wjs registry.
        $this->wjs->outputPackage[$this->type][$name]['#data'] = WJS_PUSH_JSLINK_INCLUDED;
      }
      // Avoid duplicates, it can occur when
      // loader have parent or dependencies.
      if (!in_array($this->extensions[$name][$side], $files)) {
        // Return always server path.
        $files[] = $this->extensions[$name][$side];
      }
    }
  }
}
