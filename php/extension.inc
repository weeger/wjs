<?php

namespace Wjs5;

use \Wjs5\Wjs;
use \Wjs5\Loader;

class ExtensionRequest {
  /**
   * @var Wjs
   */
  var $w;
  /**
   * @var Loader
   */
  var $loader;
  /**
   * @var string
   */
  var $extensionType;
  /**
   * @var string
   */
  var $extensionName;

  function __construct(Wjs $w, $extensionType, $extensionName) {
    $this->w             = $w;
    $this->loader        = $w->loaderGet($extensionType);
    $this->extensionType = $extensionType;
    $this->extensionName = $extensionName;
  }
}

class ExtensionClass extends ExtensionRequest {
  var $options = array();

  function __construct(Wjs $w, $extensionType) {
    // Just detect extension name with class name.
    parent::__construct($w, $extensionType, (new \ReflectionClass($this))->getShortName());
  }
}

class Extension extends ExtensionRequest {
  /**
   * @var Extension[]
   */
  var $require = array();
  var $instances = array();
  /**
   * @var bool
   */
  var $outputHidden = FALSE;
  var $info = array();
  var $pathCache;
  var $pathCacheServer;
  var $pathCacheServerDir;

  function __construct(Wjs $w, $extensionType, $extensionName, $settings = NULL, $info = NULL) {
    parent::__construct($w, $extensionType, $extensionName);
    $this->info = $info;
    // Only ony type of extension data is allowed
    if (isset($this->loader->extensions[$this->extensionName])) {
      $this->w->error('Trying to add extension twice : ' . $this->extensionType . ' > ' . $this->extensionName);
    }
    else {
      $this->loader->extensions[$this->extensionName] = $this;
    }
    $this->add($settings);
    // Build cache path.
    if ($this->cacheEnabled()) {
      // Get path for this specific type.
      $this->pathCache = $extensionType . '/' . $extensionName . $this->w->optionGet('cacheToken') . '.js';
      // Get path for file on the server.
      $this->pathCacheServer    = $this->w->optionGet('serverPathCache') . $this->pathCache;
      $this->pathCacheServerDir = dirname($this->pathCacheServer);
      // Add new dependency.
      $this->w->register('CacheLink', $this->pathCache, $this->w->optionGet('serverPathCache') . $this->pathCache);
      // Add JsLink requirement.
      $this->w->extensionAddRequire($this->extensionType, $this->extensionName, 'CacheLink', $this->pathCache);
    }
  }

  function cacheEnabled() {
    return $this->w->optionGet('staticFilesEnabled') && $this->loader->allowJsCache;
  }

  /**
   * Save extension into w.
   *
   * @param $settings
   */
  function add($settings) {
    // To override...
  }

  /**
   * Push extensions prototype to output (once).
   */
  function push() {
    // To override...
  }

  /**
   * Push extension in cached mode, if enabled.
   * @return bool Return true if cached successfully used, false to launch normal push system.
   */
  function pushCache() {
    if ($this->cacheEnabled()) {
      // By default use normal push.
      $this->push();
      return TRUE;
    }
    return FALSE;
  }

  function pushDependencies() {
    // Push requirements.
    if (!empty($this->require)) {
      foreach ($this->require as $item) {
        $this->w->extensionPush($item->extensionRequire->extensionType, $item->extensionRequire->extensionName, $item->instanceOptions);
      }
    }
  }

  /**
   * Create a new instance (multiple).
   */
  function instance($options) {
    // To override...
    return FALSE;
  }

  /**
   * Build output package.
   * @return array
   */
  function output($data = NULL) {
    $require   = array();
    $instances = array();
    $output    = array('#data' => $data);
    /* @var ExtensionDependency $extension */
    foreach ($this->require as $extensionDependency) {
      $require[$extensionDependency->extensionRequire->extensionType][] = $extensionDependency->extensionRequire->extensionName;
    }
    // Append requirements.
    if (!empty($require)) {
      $output['#require'] = $require;
    }
    // Append instances.
    if (!empty($instances)) {
      $output['#instances'] = $instances;
    }

    if ($this->cacheEnabled()) {
      // Recreate cache file.
      if ($this->w->optionGet('staticFilesFlush') === TRUE || !is_file($this->pathCacheServer)) {
        // Create directory.
        if (!is_dir($this->pathCacheServerDir)) {
          mkdir($this->pathCacheServerDir);
        }
        // Create file.
        file_put_contents($this->pathCacheServer,
          'W.cache("' . $this->extensionType . '","' . $this->extensionName . '",' . $this->loader->cacheJsEncode($output['#data']) . ');');
      }
      // Replace data by logical cache path.
      $output['#data'] = 'cache://' . $this->pathCache;
    }


    return $output;
  }

  function extensionFileTypeExists($fileExtension) {
    $filePath = $this->serverPath . $this->extensionName . '.' . $fileExtension;
    if (file_exists($filePath)) {
      return $filePath;
    }
    return FALSE;
  }
}

class ExtensionMissing extends Extension {
  var $errorCode;

  function __construct(Wjs $w, $extensionType, $extensionName, $errorCode) {
    parent::__construct($w, $extensionType, $extensionName, $errorCode);
    $this->errorCode = $errorCode;
  }

  function cacheEnabled() {
    return FALSE;
  }

  function output($data = NULL) {
    return parent::output($this->errorCode);
  }
}

class ExtensionDependency {
  /**
   * @var Extension
   */
  var $extensionOwner;
  /**
   * @var Extension
   */
  var $extensionRequire;
  /**
   * @var array
   */
  var $instanceOptions;

  function __construct(Wjs $w, Extension $extensionOwner, Extension $extensionRequire, $instanceOptions) {
    $this->extensionOwner                                                                                      = $extensionOwner;
    $this->extensionRequire                                                                                    = $extensionRequire;
    $this->instanceOptions                                                                                     = $instanceOptions;
    $this->extensionOwner->require[$extensionRequire->extensionType . '::' . $extensionRequire->extensionName] = $this;
  }
}
