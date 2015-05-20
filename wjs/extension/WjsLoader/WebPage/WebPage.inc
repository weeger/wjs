<?php

namespace Wjs\Loader;

require_once 'WebPage.class.inc';

use \Wjs\Loader;
use \Wjs\Website;

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
    // Require class, it allows to create Page
    // instances once extension added.
    $classFile = $data . $name . '.inc';
    if (is_file($classFile)) {
      require_once $classFile;
    }
  }

  function extensionPush($name, $options = array(), $value = NULL) {
    // Retrieve value saved.
    $value = $this->valuePush($name, $value);
    // Create instance if missing
    // (probably no website class used)
    if (!isset($options['instance'])) {
      $options['instance'] = $this->instance($name, array(
        'server' => $value['server'],
        'client' => $value['client'],
      ));
    }
    // Treat value as a classic WebComp
    $output = parent::extensionPush($name, $options, $value);
    if (isset($options['urlHistory'])) {
      $output['#data']['urlHistory'] = TRUE;
    }
    // Add extra parameters sent at declaration.
    if (isset($value['previous'])) {
      $output['#data']['previous'] = $value['previous'];
    }
    if (isset($value['next'])) {
      $output['#data']['next'] = $value['next'];
    }
    return $output;
  }

  function htmlLoad($name, $options, $value) {
    $html = parent::htmlLoad($name, $options, $value);
    // Get template parameters.
    $params = isset($options['params']) ? $options['params'] : array();
    /* @var \Wjs\Loader\WebPage\Page $page */
    $page = $options['instance'];
    // Execute rendering.
    return $page->render($html, $params);
  }

  function instance($name, $options = array(), $wjs = NULL, $website = NULL) {
    // Find page class name.
    $className = '\\Wjs\\Loader\\' . $this->type . '\\' . $name;
    if (!class_exists($className)) {
      $className = '\\Wjs\\Loader\\' . $this->type . '\\Page';
    }
    if (!class_exists($className)) {
      $className = '\\Wjs\\Loader\\WebPage\\Page';
    }
    $options = array_merge($options, $this->valuePush($name));
    // Use current wjs if not defined.
    if ($wjs === NULL) {
      $wjs = $this->wjs;
    }
    // Create page class.
    return new $className($this->type, $name, $options, $wjs, $website);
  }
}
