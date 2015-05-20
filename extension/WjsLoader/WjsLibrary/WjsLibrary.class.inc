<?php

namespace Wjs\Loader\WjsLibrary;

use \Wjs\Loader\WebPage\Page;

abstract class Library {
  /**
   * Each library is linked to one page instance.
   * @var \Wjs\Loader\WebPage
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

  function __construct(Page $page, $options, $value) {
    $this->page                = $page;
    $this->serverPathLibrary   = $value['classFile'];
    $this->serverPathDirectory = $page->wjs->pathDirName($value['classFile']);
    $this->clientPathDirectory = $page->wjs->pathClient($this->serverPathDirectory) . '/';
    foreach ($this->require as $libraryName) {
      $this->page->libraryLoadOnce($libraryName);
    }
    // Find name from namespace.
    $this->reflector   = new \ReflectionClass($this);
    $this->name        = $this->reflector->getShortName();
    $page->libraries[] = $this;
  }

  function push($options, $value = array()) {
    return $value;
  }

  function requirements() {
    return array();
  }
}
