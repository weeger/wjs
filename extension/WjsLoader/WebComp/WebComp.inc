<?php

namespace Wjs\Loader;

use \Wjs\Loader;

/**
 * @package Wjs\Loader
 */
class WebComp extends Loader {

  function extensionAdd($name, $data) {
    // If data is only string it's should be the path of
    // server folder, who contains a .conf ini file.
    if (!is_array($data)) {
      // Search for a json file.
      $json = $data . $name . '.json';
      if (is_file($json)) {
        $conf           = json_decode(file_get_contents($json), JSON_FORCE_OBJECT);
        $conf['server'] = $data;
      }
      // We have to build configuration from path.
      else {
        $conf = array(
          'server' => $data,
        );
      }
      $data = $conf;
    }
    if (!isset($data['client'])) {
      // Define path according wjs, this path can be wrong
      // if component is accessed into a rewritten client path.
      $data['client'] = $this->wjs->pathClient(realpath($data['server']) . '/');
    }
    // Do not add requirements as part of data.
    $require = FALSE;
    if (isset($data['require'])) {
      $require = $data['require'];
      unset($data['require']);
    }
    // Normal add.
    parent::extensionAdd($name, $data);
    // Load requirements.
    if ($require) {
      $this->wjs->extensionAddRequireArray($this->type, $name, $require);
    }
  }

  /**
   * Get content of WebComp. HTML file is loaded,
   * image links are parsed, CSS and JS requirements
   * are added as normal extensions.
   */
  function extensionPush($name, $options = array(), $value = NULL) {
    $value = $this->valuePush($name, $value);
    if (!$this->valueIsError($value)) {
      $data = '';
      if (is_dir($value['server'])) {
        $data = array(
          // By default destination is not defined.
          'destination' => isset($value['destination']) ? $value['destination'] : FALSE,
          // Html can come from outside.
          'html'        => isset($value['html']) ? $value['html'] : FALSE,
          // Define if url query strings are updated on WebComp load.
          'urlUpdate'   => isset($value['urlUpdate']) ? $value['urlUpdate'] : FALSE,
          // We can choose to display only one WebComp of each group at a time.
          'group'       => isset($value['group']) ? $value['group'] : FALSE,
        );
        // Try to load html file if no content defined.
        if (!$data['html']) {
          $htmlFile = $value['server'] . $name . '.html';
          if (is_file($htmlFile)) {
            $data['html'] = file_get_contents($htmlFile);
          }
        }
        // Html can be missing.
        if ($data['html'] !== '') {
          // Rebase links / images to web component folder.
          $data['html'] = $this->wjs->htmlRebase($data['html'], $value['client']);
          $this->wjs->htmlParseIncludeRequire($data['html'], $this->type, $name);
        }
        // Search for extra css file.
        // Use final file path in place of html or tpl file.
        $this->wjs->requireLinksClassFile(realpath($value['server']) . '/' . $name . '.css', 'css', $this->type, $name);
        // Search for extra js file.
        $this->wjs->requireLinksClassFile(realpath($value['server']) . '/' . $name . '.js', 'js', $this->type, $name);
      }
      $value = $data;
    }
    // Save value as true.
    return parent::extensionPush($name, $options, $value);
  }

  /**
   * Register WebComp from a folder content.
   */
  function scanFolderItem($directory, $item, $globalData) {
    if (is_dir($directory . $item)) {
      // Append global data.
      $this->wjs->extensionAdd($this->type, $item, $directory . $item . '/', $globalData);
    }
  }

  function query($group) {
    if (isset($_GET, $_GET[$this->type], $_GET[$this->type][$group])) {
      $this->wjs->import($this->type, $_GET[$this->type][$group]);
      return TRUE;
    }
    return FALSE;
  }
}
