<?php

namespace Wjs5;

/**
 * Loaders are separated processes used to pack / encode
 * and parse extensions from server side to client site
 * depending from extension type.
 */
abstract class Loader {
  /**
   * @var string $type
   */
  var $type;
  /**
   * @var \Wjs5\Wjs $w
   */
  var $w;
  /**
   * Contain list of registered items.
   * @var array
   */
  var $extensions = array();
  var $extensionsPushed = array();
  /**
   * Contain list of registered items.
   * @var ExtensionDependency[]
   */
  var $extensionsRequire = array();
  var $extensionsRequireOptions = array();
  var $hasJsFile = FALSE;
  /**
   * Defines if content can be exported to
   * external cache files. It is mainly used
   * to execute javascript without eval method.
   * @var bool
   */
  var $allowJsCache = FALSE;
  var $allowRequireJs = FALSE;
  /**
   * Loaders have inheritance both in PHP
   * and Javascript, we need for that
   * to transmit parent class.
   * @var bool|string
   */
  var $parentClass = FALSE;

  /**
   * @param Wjs $wjs
   */
  function __construct(Wjs $wjs) {
    $reflector  =
    $this->reflector = new \ReflectionClass($this);
    $this->type = $reflector->getShortName();
    $this->w    = $wjs;
    // Add an entry.
    $this->w->extensionsPushed[$this->type] = array();
    // Append to wjs.
    $this->w->loaders[$this->type] = $this;
    // Save class path.
    $this->classFile = $this->reflector->getFileName();
    // Find dir.
    $this->serverPath = dirname($this->classFile) . '/';
    // Check once if js exists.
    $this->hasJsFile = file_exists($this->serverPath . $this->type . '.js');
    // Get parent class type for
    // javascript inheritance.
    $parent = $reflector->getParentClass();
    if ($parent && $parent->getName() !== 'Wjs\Loader') {
      $this->parentClass = $parent->getShortName();
    }
  }

  /**
   * Allow some action when a missing extension is asked.
   *
   * @param $extensionName
   */
  function extensionGetMissing($extensionName) {
    // To override...
  }

  /**
   * Return the list of direct dependencies for given extension.
   * TODO Check
   */
  function extensionGetRequire($name, $excludeRequire = array()) {
    $require = array();
    // Get dependencies.
    if (isset($this->extensionsRequire[$name])) {
      // Cache links can't be excluded.
      if ($excludeRequire === TRUE) {
        $excludeRequire = $this->extensionsRequire[$name];
        if (isset($excludeRequire['CacheLink'])) {
          unset($excludeRequire['CacheLink']);
        }
      }
      $require = $this->extensionsRequire[$name];
      // Var can be false at this point.
      if (is_array($excludeRequire)) {
        $requireFiltered = array();
        // Only get non filtered dependencies.
        foreach ($require as $requireType => $requireItems) {
          foreach ($requireItems as $key => $requireName) {
            if (!isset($excludeRequire[$requireType]) || !in_array($requireName, $excludeRequire[$requireType])) {
              if (!isset($requireFiltered[$requireType])) {
                $requireFiltered[$requireType] = array();
              }
              $requireFiltered[$requireType][$key] = $requireName;
            }
          }
        }
        $require = $requireFiltered;
      }
    }
    return $require;
  }

  /**
   * Called when w core is asked for main js files list.
   * Render option defines if list is retrieved for information
   * only, or for final rendering process of html head.
   * It allows scripts tags to not be added via javascript,
   * bu generated on server side on page processing, and also
   * to use cache and aggregation for these files.
   */
  function headerFiles($type, &$files = array(), $side = 'client', $render = FALSE) {
    // Give pushed extensions.
    foreach ($this->extensionsPushed as $extensionName => $pushedData) {
      // Load js from dependencies,
      // duplication is managed into files addition.
      $dependencies = $this->extensionGetRequire($extensionName, $this->w->extensionExclude);
      foreach ($dependencies as $requiredType => $items) {
        foreach ($items as $requiredName) {
          if ($requiredType !== $this->type || $requiredName !== $extensionName) {
            $this->w->loaderGet($requiredType)
              ->headerFilesExtension($type, $files, $side, $render, $requiredName);
          }
        }
      }
      // Exclude non allowed js files.
      if (!$this->w->optionGet('staticFilesEnabled') || $type !== 'js' || $this->allowJsCache) {
        $file = $this->headerFilesExtension($type, $files, $side, $render, $extensionName);
        if ($file && !in_array($file, $files)) {
          $files[] = $file;
        }
      }
    }
  }

  function headerFilesExtension($type, &$files, $side, $render = FALSE, $name) {
    // To override...
    return FALSE;
  }

  /**
   * Used when cacheJs is enabled,
   * basically used to define how to manage script,
   * they may be converted from string to pure js
   * in order to avoid usage of eval method.
   *
   * @param $data
   *
   * @return string
   */
  function cacheJsEncode($data) {
    return json_encode($data);
  }

  /**
   * Choose between internal or external
   * value for given extension to push.
   */
  function valuePush($name, $value = NULL) {
    if ($value === NULL) {
      if (!isset($this->extensions[$name])) {
        return WJS5_ERR_PUSH_UNDEFINED_EXTENSION_NAME;
      }
      return $this->extensions[$name];
    }
    return $value;
  }

  function valueIsError($value) {
    return is_string($value) && strpos($value, 'WJS5_ERR_PUSH') === 0;
  }


  /**
   * Define what to do width found item
   * placed into a scanned folder.
   * It can be a file or a folder.
   */
  function scanFolderItem($directory, $item, $globalData) {
    // To override...
  }
}
