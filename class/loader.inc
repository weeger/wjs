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
   * Url of current inc file.
   * @var string $pathPhpFile
   */
  var $pathPhpFile = NULL;
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

  function __construct($routes, \Wjs $wjs) {
    parent::__construct($routes);
    $reflector           = new \ReflectionClass($this);
    $this->type          = $reflector->getShortName();
    $this->wjs           = $wjs;
    $this->pathPhpFile   = $this->pathCleanupSlashes(dirname($reflector->getFileName()) . '/');
    $this->pathJsFile    = $this->pathPhpFile . $this->type . '.js';
    $this->pathJsFile    = file_exists($this->pathJsFile) ? $this->pathJsFile : FALSE;
    $this->pathJsFileRel = $this->pathSubtract($this->pathCleanupSlashes(realpath($this->wjs->routeGet('server', 'wjs'))) . '/', $this->pathJsFile);
    // Get inheritance linage,
    // for extension load dependencies.
    /** @var \ReflectionClass $class */
    $class         = $reflector;
    $this->lineage = array();
    while ($class = $class->getParentClass()) {
      $parent = $class->getName();
      if ($parent !== 'Wjs\Loader') {
        $this->lineage[] = $class->getShortName();
      }
      else {
        break;
      }
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
        return WJS_ERR_PUSH_MISSING_EXTENSION;
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
}