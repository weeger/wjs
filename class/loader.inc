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

  function extensionPush($name, $value) {
    $package = array(
      '#data' => $value,
    );
    if (isset($this->extensionsRequire[$name])) {
      $package['#require'] = $this->extensionsRequire[$name];
      $this->wjs->extensionPushArray($this->extensionsRequire[$name]);
    }
    return $package;
  }
}