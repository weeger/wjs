<?php

namespace Wjs;

/**
 * Contain references to all extensions available fod wjs.
 * Summaries are an easy way to define strictly extensions
 * allowed to be transferred through wjs, some can be pushed
 * automatically. You can define also custom loaders location.
 * All routes are defined relatively to the summary
 * class definition file.
 */
class Summary {
  /**
   * Url of current inc file.
   * @var string $pathPhpFile
   */
  var $pathPhpFile;
  /**
   * Extensions loaders as array[loaderName] => loaderDirectory.
   * Loaders declared here are appended to the page startup package,
   * you can also add optional loaders as extensions.
   * @var array $loaders
   */
  var $loaders = array();
  /**
   * Extensions eligible to push / pull.
   * @var array
   */
  var $extensions = array();

  function __construct() {
    $reflector         = new \ReflectionClass(get_class($this));
    $this->pathPhpFile = dirname($reflector->getFileName()) . '/';
  }
}