<?php

namespace wjs;

class library {
  /**
   * Reference to a wJs object.
   * @var \wjs $w
   */
  var $w;
  /**
   * Url of current inc file.
   * @var string $inc
   */
  var $inc;
  /**
   * Url of current directory.
   * @var string $inc
   */
  var $dir;
  /**
   * Loader types array[loader_name] => parent_directory
   * @var array $collection_loader
   */
  var $collection_loader = array();
  /**
   * Registered items array[type] => array([name]=>path)
   * @var array $collection_item
   */
  var $collection_item = array();
  /**
   * Items patterns array[item_type] => array([file]=>mask)
   * @var array $collection_item_pattern
   */
  var $collection_item_pattern = array();
  /**
   * Directories to scan array[directory] => array(item_type,...)
   * @var array $collection_item_pattern_directory
   */
  var $collection_item_pattern_directory = array();
  /**
   * Group of elements to append, using output_group_append()
   * you can add to output a selected group of items.
   * @var array $output_group
   */
  var $output_group = array();
  /**
   * Groups added automatically on library appending.
   * @var array
   */
  var $output_group_default = array();

  function __construct() {
    $this->dir = dirname($this->inc);
  }
}