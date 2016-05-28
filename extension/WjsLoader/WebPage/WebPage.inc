<?php

namespace Wjs\Loader;

require_once 'WebPage.class.inc';

define('WJS_PUSH_WEBPAGE_PRELOADED', 'WJS_PUSH_WEBPAGE_PRELOADED');

use \Wjs5\Loader;

/**
 * @package Wjs\Loader
 */
class WebPage extends WebCom {
  var $lastAdded;
  var $requireCssLinks = TRUE;

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
    // HTML is required.
    if (!isset($value['html'])) {
      $value['html'] = '';
    }
    // Treat value as a classic WebCom
    $output = parent::extensionPush($name, $options, $value);
    if (!isset($output['#data']['title'])) {
      $output['#data']['title'] = $options['title'];
    }
    if (isset($options['urlHistory'])) {
      $output['#data']['urlHistory'] = $options['urlHistory'];
    }
    if (isset($options['urlAlias'])) {
      $output['#data']['urlAlias'] = $options['urlAlias'];
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

  function htmlLoad($name, $options = array(), $value = array()) {
    if (isset($options['html'])) {
      return $options['html'];
    }
    else {
      return parent::htmlLoad($name, $options, $value);
    }
  }

  function instance($name, $options = array(), $wjs = NULL, $website = NULL) {
    // Find page class name.
    $className = '\\Wjs5\\Loader\\' . $this->type . '\\' . $name;
    if (!class_exists($className)) {
      $className = '\\Wjs5\\Loader\\' . $this->type . '\\Page';
    }
    if (!class_exists($className)) {
      $className = '\\Wjs5\\Loader\\WebPage\\Page';
    }
    $value = $this->valuePush($name);
    if (!$this->valueIsError($value)) {
      $options = array_merge($options, $value);
      // Use current wjs if not defined.
      if ($wjs === NULL) {
        $wjs = $this->wjs;
      }
      // Create page class.
      return new $className($this->type, $name, $options, $wjs, $this, $website);
    }
    return FALSE;
  }
}
