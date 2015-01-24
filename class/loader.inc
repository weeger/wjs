<?php

namespace Wjs;

/**
 * Loaders are separated processes used to pack / encode
 * and parse extensions from server side to client site
 * depending from extension type.
 */
abstract class Loader extends Router {
  /**
   * @var string $type
   */
  var $type;
  /**
   * @var \wjs $w
   */
  var $wjs;
  /**
   * Contain list of registered items.
   * @var array
   */
  var $extensions = array();
  var $extensionsPushed = array();
  var $extensionsRequire = array();
  var $lineage = array();
  /**
   * Defines if content can be exported to
   * external cache files. It is mainly used
   * to execute javascript without eval method.
   * @var bool
   */
  var $allowJsCache = FALSE;
  var $parentClass = FALSE;

  function __construct($routes, \Wjs $wjs) {
    parent::__construct($routes);
    $reflector        = new \ReflectionClass($this);
    $this->type       = $reflector->getShortName();
    $this->wjs        = $wjs;
    $this->pathJsFile = $this->routeGet('server', 'js');
    $this->pathJsFile = file_exists($this->pathJsFile) ? $this->pathJsFile : FALSE;
    /** @var \ReflectionClass $class */
    $parent = $reflector->getParentClass();
    if ($parent && $parent->getName() !== 'Wjs\Loader') {
      $this->parentClass = $parent->getShortName();
    }
  }

  /**
   * Register new extension.
   *
   * @param $name
   * @param $data
   */
  function extensionAdd($name, $data) {
    $this->extensions[$name] = $data;
  }

  /**
   * Link extension to another one,
   * When pushed both extensions will be pushed.
   *
   * @param $name
   * @param $requireType
   * @param $requireName
   */
  function extensionAddRequire($name, $requireType, $requireName) {
    // Core loaders requirement is assumed.
    if ($requireType !== 'WjsLoader' || ($requireName !== 'WjsLoader' && $requireName !== 'JsLink')) {
      if (!isset($this->extensionsRequire[$name])) {
        $this->extensionsRequire[$name] = array();
      }
      if (!isset($this->extensionsRequire[$name][$requireType])) {
        $this->extensionsRequire[$name][$requireType] = array();
      }
      // Add requirements only once.
      if (!in_array($requireName, $this->extensionsRequire[$name][$requireType])) {
        $this->extensionsRequire[$name][$requireType][] = $requireName;
      }
    }
  }

  /**
   * @param       $name
   * @param bool  $excludeRequire
   * @param mixed $value
   *
   * @return array
   */
  function extensionPush($name, $excludeRequire = FALSE, $value = NULL) {
    // Search for value if not defined.
    if ($value === NULL) {
      if (isset($this->extensions[$name])) {
        $value = $this->extensions[$name];
      }
      else {
        $value = WJS_ERR_PUSH_UNDEFINED_EXTENSION;
      }
    }
    // Package base.
    $package = array(
      '#data' => $value,
    );
    // Cache links can't be excluded.
    if ($excludeRequire === TRUE) {
      $excludeRequire = $this->extensionsRequire[$name];
      if (isset($excludeRequire['CacheLink'])) {
        unset($excludeRequire['CacheLink']);
      }
    }
    // Get dependencies.
    if (isset($this->extensionsRequire[$name])) {
      $require = $this->extensionsRequire[$name];
      // Var can be false at this point.
      if (is_array($excludeRequire)) {
        // Only get non filtered dependencies.
        foreach ($this->extensionsRequire[$name] as $requireType => $requireItems) {
          if (isset($excludeRequire[$requireType])) {
            // We filter data with array values to have clean indexes,
            // it allow to javascript to save and destroy requirement properly.
            $require[$requireType] = array_values(array_diff($requireItems, $excludeRequire[$requireType]));
            if (empty($require[$requireType])) {
              unset($require[$requireType]);
            }
          }
        }
      }
      if (!empty($require)) {
        // Save require for javascript parsing.
        $package['#require'] = $require;
        // Push requirements.
        $this->wjs->extensionPushArray($require, $excludeRequire);
      }
    }
    return $package;
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
   * Return write value data,
   * from internal save or argument,
   * and manage error.
   *
   * @param $name
   * @param $value
   *
   * @return mixed
   */
  function valuePush($name, $value) {
    if ($value === NULL) {
      if (!isset($this->extensions[$name])) {
        return WJS_ERR_PUSH_UNDEFINED_EXTENSION;
      }
      return $this->extensions[$name];
    }
    return $value;
  }

  /**
   * Register WebComp from a folder content.
   * Each subdirectory is considered as a WebComp.
   *
   * @param string $directory The directory to scan with a trailing slash
   * @param array  $globalData
   * @param array  $order
   */
  function scanFolder($directory, $globalData = array(), $order = array()) {
    // Get items ordered.
    $scan = $this->wjs->scanOrdered($directory, $order);
    foreach ($scan as $item) {
      // Avoid all special folders.
      if ($item{0} !== '.') {
        $this->scanFolderItem($directory, $item, $globalData);
      }
    }
  }

  function scanFolderItem($directory, $item, $globalData) {
    // To override...
  }
}