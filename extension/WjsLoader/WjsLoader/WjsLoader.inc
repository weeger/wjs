<?php

namespace Wjs\Loader;

use \Wjs\Loader;

/**
 * Loader to load other WjsLoader loaders !
 */
class WjsLoader extends JsLink {

  function extensionAdd($name, $data) {
    if (is_string($data)) {
      $dataDetected = array(
        'server' => array(
          'class' => $data . $name . '.inc'
        ),
        'client' => array()
      );
      // Search for a js file.
      $js = $data . $name . '.js';
      if (is_file($js)) {
        $dataDetected['client']['js'] =
        $dataDetected['server']['js'] = $js;
      }
      $data = $dataDetected;
    }
    // Load PHP class definition.
    // Data is a path pointing to the main folder.
    require_once $data['server']['class'];
    $class_name                = '\Wjs\Loader\\' . $name;
    $this->wjs->loaders[$name] = new $class_name($data, $this->wjs);
    // Add requirement according to parent class.
    if ($this->wjs->loaders[$name]->parentClass) {
      $this->wjs->extensionAddRequire('WjsLoader', $name, 'WjsLoader', $this->wjs->loaders[$name]->parentClass);
    }
    // Exported data is file URL.
    $path = $this->wjs->loaderGet($name)->routeGet('client', 'js');
    if ($path) {
      $path   = array(
        'client' => $path
      );
      $server = $this->wjs->loaderGet($name)->routeGet('server', 'js');
      if ($server) {
        $path['server'] = $server;
      }
    }
    else {
      $path = TRUE;
    }
    parent::extensionAdd($name, $path);
  }

  function extensionPush($name, $excludeRequire = FALSE, $value = NULL) {
    // Avoid to add core loaders as extensions.
    if ($name !== 'WjsLoader' && $name !== 'JsLink') {
      // WjsLoader value is a folder path,
      // expecting that a js file inside it exists,
      // It also can be equal to true if prototype is
      // a basic loader (no js).
      return parent::extensionPush($name, $excludeRequire, $value);
    }
    return NULL;
  }

  /**
   * Register WjsLoader from a folder content.
   * Each subdirectory is considered as a WjsLoader.
   */
  function scanFolderItem($pathServer, $item, $globalData) {
    if (is_dir($pathServer . $item)) {
      // Get client base path.
      $pathClientRelative = $this->wjs->pathClientRelative($pathServer);
      $filePath           = realpath($pathServer . $item) . '/';
      // Append global data.
      $data = array_merge(array(
        'server' => array(
          'class' => $filePath . $item . '.inc',
        ),
      ), $globalData);
      // Add data for js file if exists.
      if (is_file($filePath . $item . '.js')) {
        $data['server']['js'] = $filePath . $item . '.js';
        $data['client']['js'] = $this->wjs->pathNormalize($pathClientRelative . $item . '/' . $item . '.js');
      }
      $this->wjs->extensionAdd($this->type, $item, $data);
    }
  }
}