<?php

namespace Wjs5\Loader;

require_once 'WjsLibrary.class.inc';

use \Wjs5\Loader;

/**
 * @package Wjs\Loader
 */
class WjsLibrary extends WebCom {
  var $allowRequireJs = TRUE;
  // Ordered by search priority.
  var $librariesLocations = array(
    'npm'   => array(
      'folder' => 'node_modules',
      'config' => 'package.json'
    ),
    'bower' => array(
      'folder' => 'bower_components',
      'config' => 'bower.json'
    ),
    'lib'   => array(
      'folder' => 'lib',
      'config' => FALSE
    )
  );

  /**
   * Missing libraries may exist into external packages managers folders.
   *
   * @param $extensionName
   */
  function extensionGetMissing($extensionName) {
    // Asking for a file will add it.
    foreach ($this->librariesLocations as $library => $info) {
      $dir = ($this->libraryDir($library, $extensionName));
      if (is_dir($dir)) {
        $this->w->extensionAdd($this->type, $extensionName, array(
          'serverPath' => $dir
        ));
        return;
      }
    }
  }

  function libraryDir($name) {
    return $this->w->optionGet('serverWorkingDirectory') . $this->librariesLocations[$name]['folder'] . '/';
  }

  function libraryConfig($name, $extensionName) {
    return $this->libraryDir($name) . $extensionName . '/' . $this->librariesLocations[$name]['config'];
  }

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
  /**
   * @var \Wjs5\Loader\WjsLibrary $loader
   */
  var $loader;

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
    $locations = $this->loader->librariesLocations;
    foreach ($locations as $name => $data) {
      if ($this->infoLoadLinksFrom($name, $type)) {
        return;
      }
    }
  }

  function infoLoadLinksFrom($locationName, $type) {
    if (isset($this->info['location'][$locationName]['client'][$type])) {
      $filesInfo   = $this->info['location'][$locationName];
      $files       = $filesInfo['client'][$type];
      $requireType = ucfirst($type) . 'Link';
      $basePath    = $this->loader->libraryDir($locationName);
      switch ($locationName) {
        case 'bower':
          $basePath .= 'bower_components/';
          $bowerJson = $this->loader->libraryConfig($locationName, $this->extensionName);
          // Folder may be specified.
          if (is_file($bowerJson)) {
            $json = json_decode(file_get_contents($bowerJson), JSON_OBJECT_AS_ARRAY);
            if (isset($json['dependencies'])) {
              // Every dependency must have been saved as WjsLibrary.
              foreach ($json['dependencies'] as $libraryName => $version) {
                $this->w->extensionAddRequire($this->extensionType, $this->extensionName, 'WjsLibrary', $libraryName);
              }
            }
          }
          break;
      }
      // Folder may be specified.
      if (isset($filesInfo['folderName'])) {
        $basePath .= $filesInfo['folderName'] . "/";
      }
      if (file_exists($basePath)) {
        // Load all files.
        foreach ($files as $fileName) {
          // Add new extension.
          $this->w->extensionAdd($requireType, $this->w->clientPath($basePath . $fileName), NULL);
          // Make requirement.
          $this->w->extensionAddRequire($this->extensionType, $this->extensionName, $requireType, $this->w->clientPath($basePath . $fileName));
        }
        return TRUE;
      }
    }
    return FALSE;
  }

  function instance($options) {
    if ($this->classFile) {
      require_once $this->classFile;
    }
    return new $this->className($options);
  }

  function output($data = NULL) {
    return parent::output(TRUE);
  }
}
