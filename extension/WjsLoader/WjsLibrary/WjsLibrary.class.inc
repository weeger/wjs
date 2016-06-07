<?php

namespace Wjs5\Loader\WjsLibrary;

class Library {
  /**
   * Each library is linked to one page instance.
   * @var \Wjs5\Loader\WebPage
   */
  var $page;
  /**
   * @var \ReflectionClass
   */
  var $reflector;
  var $name = 'undefined';
  var $require = array();
  var $hiddenPush = TRUE;
  var $serverPathLibrary;
  var $serverPathDirectory;
  var $clientPathDirectoryOrig;
  var $clientPathDirectory;

  function __construct() {
    // Find name from namespace.
    $this->reflector   = new \ReflectionClass($this);
    $this->name        = $this->reflector->getShortName();
    $this->init();
  }

  function init() {
    // To override.
  }

  function push() {
    // To override.
  }

  function requirements() {
    return array();
  }
}
