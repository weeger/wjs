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

  function add(\Wjs $wjs) {
    // To override.
  }

  /**
   * Retrieve extensions, called by wjs.
   * Allow to build paths dynamically,
   * wjs instance is also passed as argument,
   * and let user to build paths accordingly.
   *
   * @param \Wjs $wjs
   *
   * @return array
   */
  function getExtensions(\Wjs $wjs) {
    return array();
  }
}