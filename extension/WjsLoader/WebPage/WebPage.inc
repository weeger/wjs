<?php

namespace Wjs\Loader;

use \Wjs\Loader;

/**
 * @package Wjs\Loader
 */
class WebPage extends WebComp {
  var $lastAdded;

  function extensionAdd($name, $data) {
    parent::extensionAdd($name, $data);
    // Connect with last added page.
    if ($this->lastAdded) {
      // Add new as next for last added page.
      if (!isset($this->extensions[$this->lastAdded]['next'])) {
        $this->extensions[$this->lastAdded]['next'] = $name;
      }
      // Add last added page as previous for this new one.
      if (!isset($this->extensions[$name]['previous'])) {
        $this->extensions[$name]['previous'] = $this->lastAdded;
      }
    }
    $this->lastAdded = $name;
  }

  function extensionPush($name, $excludeRequire = array(), $value = NULL) {
    // Retrieve value saved.
    $value = $this->valuePush($name, $value);
    // Treat value as a classic HtmlDoc
    $output = parent::extensionPush($name, $excludeRequire, $value);
    // Add extra parameters sent at declaration.
    if (isset($value['previous'])) {
      $output['#data']['previous'] = $value['previous'];
    }
    if (isset($value['next'])) {
      $output['#data']['next'] = $value['next'];
    }
    return $output;
  }
}
