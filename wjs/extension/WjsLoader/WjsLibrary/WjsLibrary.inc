<?php

namespace Wjs\Loader;

require_once 'WjsLibrary.class.inc';

use \Wjs\Loader;

/**
 * @package Wjs\Loader
 */
class WjsLibrary extends WebComp {
  /**
   * Library instances are created on extension add.
   * PHP Library content is loaded separately by page.
   */
  function extensionAdd($name, $data) {
    $classFile = $data . '/' . $name . '.inc';
    require_once $classFile;
    // Save options only, instance is created
    // for each page.
    parent::extensionAdd($name, array(
      'server'    => $data,
      'className' => '\\Wjs\\Loader\\WjsLibrary\\' . $name,
      'classFile' => $classFile
    ));
  }

  /**
   * Creates a new instance of library.
   *
   * @param       $name
   * @param array $options
   * @param null  $value
   *
   * @return mixed|void
   */
  function extensionPush($name, $options = array(), $value = NULL) {
    $value = $this->valuePush($name, $value);
    if (!$this->valueIsError($value)) {
      /* @var \Wjs\Loader\WebPage\Page $page */
      $page = $options['page'];
      /* @var \Wjs\Loader\WjsLibrary\Library $library */
      $library = new $value['className']($page, $options, $value);
      $value   = $library->push($options, array(
        // Let only values use by WebComp parent loader.
        'server' => $value['server']
      ));
      // Add requirements for library.
      $this->wjs->extensionAddRequireArray($this->type, $name, $library->requirements());
      $output = parent::extensionPush($name, $options, $value);
      // Libraries can be only a collection of requirements.
      if ($library->hiddenPush) {
        return WJS_PUSH_HIDDEN_EXTENSION;
      }
      return $output;
    }
    return parent::extensionPush($name, $options, $value);
  }

  /**
   * Register WebComp from a folder content.
   */
  function scanFolderItem($directory, $item, $globalData) {
    // Resolve path to support symlinks.
    if (is_dir(realpath($directory) . '/' . $item)) {
      $this->wjs->extensionAdd($this->type, $item, $directory . $item);
    }
  }
}
