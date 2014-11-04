<?php

namespace Wjs\Loader;

use \Wjs\Loader;

/**
 * Loader to load other WjsLoader loaders !
 */
class WjsLoader extends jsLink {

  function extensionAdd($name, $data) {
    // Load PHP class definition.
    // Data is a path pointing to the main folder.
    require_once $data[0];
    $class_name                = '\Wjs\Loader\\' . $name;
    $this->wjs->loaders[$name] = new $class_name(NULL, $this->wjs);
    // Add requirement according saved lineage.
    foreach ($this->wjs->loaders[$name]->lineage as $loader) {
      $this->wjs->extensionAddRequire('WjsLoader', $name, 'WjsLoader', $loader);
    }
    parent::extensionAdd($name, $data);
  }

  function extensionPush($name, $value, $excludeRequire = FALSE) {
    // Avoid to add core loaders as extensions.
    if ($name !== 'WjsLoader' && $name !== 'JsLink') {
      // Exported data is file URL.
      $path = isset($value[1]) ? $value[1] : TRUE;
      // WjsLoader value is a folder path,
      // expecting that a js file inside it exists,
      // It also can be equal to true if prototype is
      // a basic loader (no js).
      return parent::extensionPush($name, is_file($path) ? $path : TRUE, $excludeRequire);
    }
  }

  function jsFiles($flush) {
    $files = array();
    foreach ($this->extensionsPushed as $name => $package) {
      if (isset($this->extensions[$name][1])) {
        $files[] = $this->extensions[$name][1];
      }
    }
    if ($flush) {
      // Loading js file cancel extension loading.
      $this->extensionPushedFlush();
    }
    return $files;
  }
}