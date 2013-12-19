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
    $wjs = null;

  function __construct($type, $wjs) {
    $this->type = $type;
    $this->wjs = $wjs;
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
