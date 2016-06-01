<?php

namespace Wjs5\Loader;

use \Wjs5\Loader;

define('WJS5_PUSH_JSLINK_INCLUDED', 'WJS5_PUSH_JSLINK_INCLUDED');

/**
 * @package Wjs5\Loader
 */
class JsLink extends Loader {
  var $allowRequireJs = TRUE;

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
          // Remove into w registry.
        $this->w->outputPackage[$this->type][$name]['#data'] = WJS5_PUSH_JSLINK_INCLUDED;
      }
      // Avoid duplicates, it can occur when
      // loader have parent or dependencies.
      $sidePath = $side . 'Path';
      if (!in_array($this->extensions[$name]->$sidePath, $files)) {
        // Return always server path.
        $files[] = $this->extensions[$name]->$sidePath;
      }
    }
  }
}

namespace Wjs5\Loader\JsLink;

class Extension extends \Wjs5\Extension {
  var $serverPath;
  var $clientPath;

  function add($settings) {
    if (is_array($settings)) {
      if (isset($settings['serverPath'])) {
        $this->serverPath = $settings['serverPath'];
      }
      if (isset($settings['clientPath'])) {
        $this->clientPath = $settings['clientPath'];
      }
    }
    else if (is_string($settings)) {
      // Allow to have only path as settings.
      $this->serverPath = $settings;
    }
    else if ($settings === NULL) {
      // Allow to not define the URL as name.
      $this->serverPath = realpath($this->extensionName);
    }
    // Server file must be accessible.
    if (!is_file($this->serverPath)) {
      $this->serverPath = FALSE;
    }
    // Find client path from server path if missing.
    if (!$this->clientPath) {
      $this->clientPath = $this->w->clientPath(realpath($this->serverPath));
    }
    // Use minified files for master versions.
    if ($this->w->subversion !== 'source' && $this->serverPath) {
      // Get minified path.
      $minJs = $this->w->filePathMin($this->serverPath, 'js');
      // Minified file must exists.
      if (is_file($minJs)) {
        $this->serverPath = $minJs;
        // Minify also client path.
        if (isset($this->clientPath)) {
          $this->clientPath = $this->w->filePathMin($this->clientPath, 'js');
        }
      }
    }
    // Try to load file content,
    // and search for @require declarations.
    if ($this->serverPath && $this->serverPath) {
      $this->w->jsParseRequire($this->extensionType, $this->extensionName, file_get_contents($this->serverPath));
    }
  }

  function output($data = NULL) {
    return parent::output($this->clientPath ? $this->clientPath : TRUE);
  }
}
