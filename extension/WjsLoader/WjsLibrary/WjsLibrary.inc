<?php

namespace Wjs5\Loader;

require_once 'WjsLibrary.class.inc';

use \Wjs5\Loader;

/**
 * @package Wjs\Loader
 */
class WjsLibrary extends WebCom {
  var $allowRequireJs = TRUE;

  /**
   * Register WebCom from a folder content.
   */
  function scanFolderItem($directory, $item, $globalData) {
    // Resolve path to support symlinks.
    if (is_dir(realpath($directory) . '/' . $item)) {
      $this->w->extensionAdd($this->type, $item, $directory . $item . '/');
    }
  }
}

namespace Wjs5\Loader\WjsLibrary;

class Extension extends \Wjs5\Loader\WebCom\Extension {
  var $classFile;
  var $className = '\\Wjs5\\Loader\\WjsLibrary\\Library';
  var $info;

  function add($settings) {
    parent::add($settings);
    $classFile = $this->serverPath . $this->extensionName . '.inc';
    if (is_file($classFile)) {
      $this->classFile = $this->serverPath . $this->extensionName . '.inc';
      $this->className = '\\Wjs5\\Loader\\WjsLibrary\\' . $this->extensionName;
    }
    $this->info = $this->w->infoFileLoad($this->serverPath . $this->extensionName . '.wex');
    $this->infoLoadLinks('js');
    $this->infoLoadLinks('css');
  }

  function infoLoadLinks($type) {
    if (isset($this->info['client'][$type])) {
      $requireType = ucfirst($type) . 'Link';
      $basePath    = $this->w->optionGet('serverWorkingDirectory') . 'lib/' . $this->info['folderName'] . "/";
      foreach ($this->info['client'][$type] as $fileName) {
        // Add new extension.
        $this->w->import($requireType, $this->w->clientPath($basePath . $fileName));
        // Make requirement.
        $this->w->extensionAddRequire($this->extensionType, $this->extensionName, $requireType, $this->w->clientPath($basePath . $fileName));
      }
    }
  }

  function instance($options) {
    if ($this->classFile) {
      require_once $this->classFile;
    }
    return new $this->className($options);
  }
}
