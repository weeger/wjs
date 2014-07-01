<?php

namespace wjs;

/**
 * Class loader
 * Base class for other loaders types.
 */
class loader extends \wjs\transcode {
  /**
   * @var string
   */
  var $type = 'undefined';
  /**
   * Contain list of registered items.
   * @var array
   */
  var $items = array();
  /**
   * Contain output content.
   * @var array
   */
  var $output = array();
  /**
   * @var \wjs $w
   */
  var $wjs;
  /**
   * Contain value of __FILE__ called
   * on class definition.
   * @var null
   */
  var $inc = NULL;

  function __construct($paths, $type, \wjs $wjs, $js_file = TRUE) {
    parent::__construct($paths);
    $this->type = $type;
    $this->wjs  = $wjs;
    if ($this->inc === NULL) {
      trigger_error('wjs error : loader ' . $this->type . '->inc can\'t be null (should contain __FILE__ value)');
    }
    else {
      $this->inc = $this->path_cleanup($this->inc);
    }
    $this->wjs->output_append_transcode($this, $type);
    $this->init();
  }

  function init() {
    // To override...
  }

  function item_register($name, $path) {
    $this->items[$name] = $path;
  }

  /**
   * Append object to the output array.
   *
   * @param string $name
   *
   * @return string
   */
  function output_append($name) {
    // To override..
    return $name;
  }

  function js_file() {
    return 'loader.' . $this->type . '.js';
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
