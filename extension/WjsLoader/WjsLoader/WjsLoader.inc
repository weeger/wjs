<?php

namespace Wjs\Loader;

use \Wjs\Loader;

/**
 * Loader to load other WjsLoader loaders !
 */
class WjsLoader extends JsLink {

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
        // according to resolved path of wjs.
        $value['serverPathJs'] = $filePath;

      }
    }
    // If only server path to js is found,
    // try to detect his path from client side.
    if (isset($value['serverPathJs']) && !isset($value['clientPathJs'])) {
      $value['clientPathJs'] = $this->wjs->pathClient(realpath($this->wjs->pathClient($value['serverPathJs'])));
    }
    // Load PHP class definition.
    // Data is a path pointing to the main folder.
    require_once $value['classFile'];
    $className = '\Wjs\Loader\\' . $name;
    /* @var \Wjs\Loader $loader */
    $this->wjs->loaders[$name] = $loader = new $className($value, $this->wjs);
    // Add requirement according to parent class.
    if ($this->wjs->loaders[$name]->parentClass) {
      $this->wjs->extensionAddRequire('WjsLoader', $name, 'WjsLoader', $this->wjs->loaders[$name]->parentClass);
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
    if (!$this->wjs->isCoreExtension($this->type, $name)) {
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
      $this->wjs->extensionAdd($this->type, $item, $data);
    }
  }
}
