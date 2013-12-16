<?php

/**
 * Class loader
 * Base class for other loaders types.
 */
class loader {
  // Contain list of registered items.
  var $items = array(),
    $output = array(),
    $wjs = null;

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
