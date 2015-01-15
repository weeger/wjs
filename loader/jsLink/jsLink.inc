<?php

namespace Wjs\Loader;

use \Wjs\Loader;

/**
 * @package Wjs\Loader
 */
class JsLink extends Loader {
  function extensionAdd($name, $value) {
    parent::extensionAdd($name, $value);
    // Try to load file content,
    // and search for @require declarations.
    if (is_array($value) && is_string($value['server']) && is_file($value['server'])) {
      $this->wjs->jsParseRequire($this->type, $name, file_get_contents($value['server']));
    }
  }

  function extensionPush($name, $excludeRequire = FALSE, $value = NULL) {
    $value = $this->valuePush($name, $value);
    if ($value !== WJS_ERR_PUSH_UNDEFINED_EXTENSION && is_array($value) && isset($value['client'])) {
      $value = $value['client'];
    }
    return parent::extensionPush($name, $excludeRequire, $value);
  }
}
