<?php

namespace Wjs;

/**
 * Loaders are separated processes used to pack / encode
 * and parse extensions from server side to client site
 * depending from extension type.
 */
class Loader extends Router {
  /**
   * @var string $name
   */
  var $name;
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
  var $extensionsRequire = array();

  function __construct($routes, $name, \Wjs $wjs) {
    parent::__construct($routes);
    $this->name          = $name;
    $this->wjs           = $wjs;
    $reflector           = new \ReflectionClass(get_class($this));
    $this->pathPhpFile   = $this->pathCleanupSlashes(dirname($reflector->getFileName()) . '/');
    $this->pathJsFile    = $this->pathPhpFile . $this->name . '.js';
    $this->pathJsFile    = file_exists($this->pathJsFile) ? $this->pathJsFile : FALSE;
    $this->pathJsFileRel = $this->pathSubtract($this->pathCleanupSlashes(realpath($this->wjs->routeGet('server', 'wjs'))) . '/', $this->pathJsFile);
  }

  function extensionAdd($name, $path) {
    $this->extensions[$name] = $path;
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
   * @param            $name
   * @param            $value
   * @param bool|array $excludeRequire
   *
   * @return array
   */
  function extensionPush($name, $value, $excludeRequire = FALSE) {
    $package = array(
      '#data' => $value,
    );
    // Add dependency to element loader itself,
    // Do not load core loaders extensions.
    if (!isset($this->wjs->summaries['Wjs\WjsCoreSummary']->loaders[$this->name])) {
      $this->extensionAddRequire($this->name, $name, 'wjsLoader', $this->name);
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
          }
        }
      }
      // Save require for javascript parsing.
      $package['#require'] = $require;
      // Push requirements.
      $this->wjs->extensionPushArray($require);
    }
    return $package;
  }
}