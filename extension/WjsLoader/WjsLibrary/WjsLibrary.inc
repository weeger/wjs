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
    $path          = realpath($directory) . '/' . $item;
    $extensionName = $item;
    // Resolve path to support symlinks.
    if (is_dir($path)) {
      $options = array(
        'serverPath' => $path . '/'
      );
    }
    else {
      // File name is the name of library.
      $info          = pathinfo($path);
      $extensionName = $info['filename'];
      $options       = array(
        'serverPath' => $path,
        'infoFile'   => $path
      );
    }
    $this->w->extensionAdd($this->type, $extensionName, $options);
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
    $infoFile   = (isset($settings['infoFile'])) ? $settings['infoFile'] : $this->serverPath . $this->extensionName . '.wex';
    $this->info = $this->w->infoFileLoad($infoFile);
    $this->infoLoadLinks('js');
    $this->infoLoadLinks('css');
    if (isset($this->info['require'])) {
      $this->w->extensionAddRequireArray($this->extensionType, $this->extensionName, $this->info['require']);
    }
  }

  function infoLoadLinks($type) {
    if (isset($this->info['client'][$type])) {
      $requireType = ucfirst($type) . 'Link';
      $basePath    = $this->w->optionGet('serverWorkingDirectory') . 'lib/';
      if (isset($this->info['folderName'])) {
        $basePath .= $this->info['folderName'] . "/";
      }
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
