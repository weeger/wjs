<?php

namespace Wjs5\Loader;

require_once 'WjsLibrary.class.inc';

use \Wjs5\Loader;

/**
 * @package Wjs\Loader
 */
class WjsLibrary extends WebCom {
  var $allowRequireJs = TRUE;
  var $requireCssLinks = TRUE;
  var $requireJsLinks = TRUE;

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
      'className' => '\\Wjs5\\Loader\\WjsLibrary\\' . $name,
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
      /* @var \Wjs5\Loader\WebPage\Page $page */
      $page = $options['page'];
      /* @var \Wjs5\Loader\WjsLibrary\Library $library */
      $library = new $value['className']($page, $options, $value);
      $value   = $library->push($options, array(
        // Let only values use by WebCom parent loader.
        'server' => $value['server']
      ));
      // Add requirements for library.
      $this->w->extensionAddRequireArray($this->type, $name, $library->requirements());
      $output = parent::extensionPush($name, $options, $value);
      // Libraries can be only a collection of requirements.
      if ($library->hiddenPush) {
        return WJS5_PUSH_HIDDEN_EXTENSION;
      }
      return $output;
    }
    return parent::extensionPush($name, $options, $value);
  }

  /**
   * Register WebCom from a folder content.
   */
  function scanFolderItem($directory, $item, $globalData) {
    // Resolve path to support symlinks.
    if (is_dir(realpath($directory) . '/' . $item)) {
      $this->w->extensionAdd($this->type, $item, $directory . $item);
    }
  }
}
