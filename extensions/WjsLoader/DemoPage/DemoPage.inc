<?php

namespace Wjs\Loader;

use \Wjs\Loader;

class DemoPage extends WebPage {
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

  function extensionPush($name, $excludeRequire = FALSE, $value = NULL) {
    // Retrieve value saved.
    $value = $value === NULL ? $this->extensions[$name] : $value;
    // Treat value as a classic HtmlDoc
    $output = parent::extensionPush($name, $excludeRequire, $value);
    // Add extra parameters sent at declaration.
    $output['#data'] = array_merge($output['#data'], $value);
    return $output;
  }
}
