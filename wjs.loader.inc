<?php

/**
 * Class loader
 * Base class for other loaders types.
 */
class loader {
  // Contain list of registered items.
  var $type = 'undefined',
    $items = array(),
    $output = array(),
    $wjs = null,
    $dir = null,
    $js_file = '';

  function __construct($type, $wjs) {
    $this->type = $type;
    $this->wjs = $wjs;
    $this->js_file = substr(dirname($this->dir), strlen(getcwd()) + 1) . '/loader.' . $this->type . '.js';
  }

  function item_register($name, $path) {
    $this->items[$name] = $path;
  }

  /**
   * Append object to the output array.
   */
  function output_append($name) {
    // To override..
  }

  /**
   * Pack object when generating output.
   * Packing can include cache management or other
   * string treatment to allow javascript to parse
   * content correctly.
   */
  function item_pack($type, $name, $script) {
    return $script;
  }
}
