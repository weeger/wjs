<?php

namespace Wjs5\Loader;

require_once 'WebPage.class.inc';

define('WJS5_PUSH_WEBPAGE_PREPROCESSED', 'WJS5_PUSH_WEBPAGE_PREPROCESSED');

use \Wjs5\Loader;

/**
 * @package Wjs5\Loader
 */
class WebPage extends WebCom {
  var $lastAdded;
}

namespace Wjs5\Loader\WebPage;

use \Wjs5\Loader\WebPage;

class Extension extends \Wjs5\Loader\WebCom\Extension {
  var $classFile;
  var $className;
  /**
   * @var Page[]
   */
  var $pageInstances = array();
  /**
   * @var WebPage
   */
  var $loader;
  /**
   * @var Page
   */
  var $previousPage;
  /**
   * @var Page
   */
  var $nextPage;

  function add($settings) {
    parent::add($settings);
    // Require class, it allows to create Page
    // instances once extension added.
    $this->classFile = $this->extensionFileTypeExists('inc');
    // Connect with last added page.
    if ($this->loader->lastAdded) {
      // Save previous.
      $this->previousPage = $this->w->extensionGet($this->extensionType, $this->loader->lastAdded);
      // Save as next into previous.
      $this->previousPage->nextPage = $this;
    }
    $this->loader->lastAdded = $this->extensionName;
    // Require class, it allows to create Page
    // instances once extension added.
  }

  function push() {
    if (is_file($this->classFile)) {
      require_once $this->classFile;
    }
    // Find page class name.
    $className = '\\Wjs5\\Loader\\' . $this->extensionType . '\\' . $this->extensionName;
    if (!class_exists($className)) {
      $className = '\\Wjs5\\Loader\\' . $this->extensionType . '\\Page';
    }
    if (!class_exists($className)) {
      $className = '\\Wjs5\\Loader\\WebPage\\Page';
    }
    $this->className = $className;
    return parent::push();
  }

  /**
   * Get content of WebCom. HTML file is loaded,
   * image links are parsed.
   */
  function instance($options) {
    /* @var $pageInstance \Wjs5\Loader\WebPage\Page */
    $pageInstance = new $this->className($this, $options);
    $this->html  = $pageInstance->renderBody();
    // Create page class.
    $this->pageInstances[] = $pageInstance;
    return parent::instance($options);
  }
}
