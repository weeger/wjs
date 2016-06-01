<?php

namespace Wjs5\Loader;

require_once 'WjsLoader.class.inc';

use \Wjs5\Loader;

/**
 * Loader to load other WjsLoader loaders !
 */
class WjsLoader extends JsLink {
  var $allowRequireJs = TRUE;

  /**
   * Register WjsLoader from a folder content.
   * Each directory is considered as a WjsLoader type.
   */
  function scanFolderItem($serverPath, $item, $globalData) {
    $dirPath = $serverPath . $item;
    // Loaders are directories.
    if (is_dir($dirPath)) {
      $filesPath = realpath($dirPath) . '/' . $item;
      // Append global data.
      $this->w->extensionAdd($this->type, $item, array(
        // Assume that php .inc file exists.
        'classFile' => $filesPath . '.inc',
      ), array(), $filesPath . '.wex');
    }
  }
}

namespace Wjs5\Loader\WjsLoader;

use Wjs5\ExtensionDependency;
use Wjs5\Loader;

class Extension extends \Wjs5\Loader\JsLink\Extension {
  var $classFile;
  /**
   * @var \Wjs5\Loader
   */
  var $loaderInstance;

  function add($settings) {
    if ($settings instanceof Loader) {
      // Use instance.
      $this->loaderInstance = $settings;
      // Class file is found by class.
      $this->classFile = $this->loaderInstance->classFile;
    }
    else {
      // Allow one string as argument.
      $this->classFile = (is_string($settings)) ? $settings : $settings['classFile'];
      // Instance have not been created.
      // Load PHP class definition.
      require_once($this->classFile);
      // Data is a path pointing to the main folder.
      // Find instance name.
      $className = '\\Wjs5\\Loader\\' . $this->extensionName;
      // Build instance.
      $this->loaderInstance = new $className($this->w);
    }
    // Search for dependencies.
    $directory = dirname($this->classFile) . '/extension/';
    if (is_dir($directory)) {
      // We loose manual ordering in this case.
      $this->w->scanFolderExtensions($directory);
    }
    // Add requirement from parent class.
    $this->requireFromClassParent($this->loaderInstance,
      // Give internal reflector to avoid to recreate it.
      $this->loaderInstance->reflector);
    // Build path to js.
    parent::add(dirname($this->classFile) . '/' . $this->extensionName . '.js');
  }

  function push() {
    // Avoid to add core loaders as extensions.
    if (!$this->w->isCoreExtension($this->extensionType, $this->extensionName)) {
      // WjsLoader value is a folder path,
      // expecting that a js file inside it exists,
      // It also can be equal to true if prototype is
      // a basic loader (no js).
      return parent::push();
    }
    return NULL;
  }

  function requireFromClassParent($object, $reflector = NULL) {
    if (!$reflector) {
      $reflector = new \ReflectionClass($object);
    }
    $parent = $reflector->getParentClass()->getShortName();
    // Parent should be valid.
    if ($parent && $parent !== 'Loader' && !$this->w->isCoreExtension($this->extensionType, $parent)) {
      // Create a requirement.
      $this->w->extensionAddRequire($this->extensionType, $this->extensionName, $this->extensionType, $parent);
    }
  }
}
