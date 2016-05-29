<?php

namespace Wjs5\Loader;

require_once 'WjsLoader.class.inc';

use \Wjs5\Loader;

/**
 * Loader to load other WjsLoader loaders !
 */
class WjsLoader extends JsLink {
  var $allowRequireJs = TRUE;

  function extensionAdd($name, $value) {
    $value = $this->valuePush($name, $value);
    // Allow one string argument.
    if (is_string($value)) {
      $value = array(
        'classFile' => $value
      );
    }
    // Detect js file.
    if (!isset($value['serverPathJs'])) {
      $filePath = dirname($value['classFile']) . '/' . $name . '.js';
      // Add data for js file if exists.
      if (is_file($filePath)) {
        // Scan return resolved links,
        // so we have to locate loader,
        // according to resolved path of w.
        $value['serverPathJs'] = $filePath;
      }
    }
    // If only server path to js is found,
    // try to detect his path from client side.
    if (isset($value['serverPathJs']) && !isset($value['clientPathJs'])) {
      $value['clientPathJs'] = $this->w->pathClient(realpath($value['serverPathJs']));
    }
    // Load PHP class definition.
    // Data is a path pointing to the main folder.
    require_once $value['classFile'];
    $className = '\Wjs5\Loader\\' . $name;
    /* @var \Wjs5\Loader $loader */
    $this->w->loaders[$name] = $loader = new $className($value, $this->w);
    // Add requirement according to parent class.
    if ($this->w->loaders[$name]->parentClass && $this->w->loaders[$name]->parentClass !== 'Loader') {
      $this->w->extensionAddRequire('WjsLoader', $name, 'WjsLoader', $this->w->loaders[$name]->parentClass);
    }
    // Exported data is file URL.
    $path = $loader->optionGet('clientPathJs');
    if ($path) {
      $path   = array(
        'client' => $path
      );
      $server = $loader->optionGet('serverPathJs');
      if ($server) {
        $path['server'] = $server;
      }
    }
    else {
      $path = TRUE;
    }
    parent::extensionAdd($name, $path);
  }

  function extensionPush($name, $options = array(), $value = NULL) {
    // Avoid to add core loaders as extensions.
    if (!$this->w->isCoreExtension($this->type, $name)) {
      // WjsLoader value is a folder path,
      // expecting that a js file inside it exists,
      // It also can be equal to true if prototype is
      // a basic loader (no js).
      return parent::extensionPush($name, $options, $value);
    }
    return NULL;
  }

  function headerFilesExtension($type, &$files, $side, $render = FALSE, $name) {
    // Basic loaders has no js files and are "true".
    if ($type === 'js' && is_string($this->extensions[$name][$side])) {
      // Parent js links mark data as included.
      parent::headerFilesExtension($type, $files, $side, $render, $name);
      // Return client or server paths.
      return $this->extensions[$name][$side];
    }
    return '';
  }

  function scanFolderExtensions($directory, $globalData = array(), $order = array()) {
    // Normal scan, but don't register
    // extension subdirectories in order to have
    // all new WjsLoaders available on scan.
    parent::scanFolderExtensions($directory, $globalData, $order);
    // Now we can search for extra extensions.
    // Get items ordered.
    $scan = $this->w->scanFolderOrdered($directory, $order);
    foreach ($scan as $item) {
      // Avoid all special folders.
      if ($item{0} !== '.') {
        $extensionPath = $directory . $item . '/extension/';
        if (is_dir($extensionPath)) {
          $this->w->scanFolderExtensions($extensionPath);
        }
      }
    }
  }

  /**
   * Register WjsLoader from a folder content.
   * Each subdirectory is considered as a WjsLoader.
   */
  function scanFolderItem($pathServer, $item, $globalData) {
    $dirPath = $pathServer . $item;
    // Loaders are directories.
    if (is_dir($dirPath)) {
      // Get path to class.
      $filePath = realpath($dirPath) . '/';
      // Append global data.
      $data = array_merge(array(
        // Assume that php .inc file exists.
        'classFile' => $filePath . $item . '.inc',
      ), $globalData);
      $this->w->extensionAdd($this->type, $item, $data);
    }
  }
}
