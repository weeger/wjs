<?php

namespace Wjs;

/**
 * Loaders are separated processes used to pack / encode
 * and parse extensions from server side to client site
 * depending from extension type.
 */
class Loader extends Router {
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

  function extensionAdd($name, $data) {
    $this->extensions[$name] = $data;
  }

  function extensionAddRequire($name, $requireType, $requireName) {
    if (!isset($this->extensionsRequire[$name])) {
      $this->extensionsRequire[$name] = array();
    }
    if (!isset($this->extensionsRequire[$name][$requireType])) {
      $this->extensionsRequire[$name][$requireType] = array();
    }
    $this->extensionsRequire[$name][$requireType][] = $requireName;
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
    // Add dependency to element loader itself,
    // Do not load core loaders extensions.
    if ($this->type !== 'WjsLoader' && $this->type !== 'JsLink') {
      $this->extensionAddRequire($name, 'WjsLoader', $this->type);
    }
    // Get dependencies.
    if (isset($this->extensionsRequire[$name]) && $excludeRequire !== TRUE) {
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
}