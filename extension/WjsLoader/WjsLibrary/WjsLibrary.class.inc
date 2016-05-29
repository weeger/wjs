<?php

namespace Wjs5\Loader\WjsLibrary;

use \Wjs5\Loader\WebPage\Page;

abstract class Library {
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

  function __construct(Page $page, $options, $value) {
    $this->page                = $page;
    $this->serverPathLibrary   = $value['classFile'];
    $this->serverPathDirectory = $page->w->pathDirName($value['classFile']);
    // Save lib path allow class to be extended
    // while keeping path to the original library.
    $this->clientPathDirectoryOrig =
      // This variable could be overriden.
    $this->clientPathDirectory = $page->w->pathClient($this->serverPathDirectory) . '/';
    foreach ($this->require as $libraryName) {
      $this->page->libraryLoadOnce($libraryName);
    }
    // Find name from namespace.
    $this->reflector   = new \ReflectionClass($this);
    $this->name        = $this->reflector->getShortName();
    $page->libraries[] = $this;
    $this->init($options);
  }

  function init($options) {
    // To override.
  }

  function push($options, $value = array()) {
    return $value;
  }

  function requirements() {
    return array();
  }
}
