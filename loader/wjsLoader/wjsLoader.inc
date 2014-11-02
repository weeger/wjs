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
    if (!isset($this->wjs->summaries['Wjs\WjsCoreSummary']->loaders[$name])) {
      // Exported data is file URL.
      $path = $value[1];
      // WjsLoader value is always a folder path,
      // expecting that a js file inside it exists.
      return parent::extensionPush($name, is_file($path) ? $path : TRUE, $excludeRequire);
    }
  }
}