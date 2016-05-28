<?php

namespace Wjs5\Loader;

use \Wjs5\Loader;

/**
 * @package Wjs\Loader
 */
class WebCom extends Loader {
  var $allowRequireJs = TRUE;
  var $requireCssLinks = TRUE;
  var $requireJsLinks = TRUE;

  function extensionAdd($name, $data) {
    // If data is only string it's should be the path of
    // server folder, who contains a .conf ini file.
    if (!is_array($data)) {
      $data = array(
        'server' => $data,
      );
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
    // Load sub extensions
    $extension = $data['server'] . '/extension/';
    if (is_dir($extension)) {
      $this->wjs->scanFolderExtensions($extension);
    }
    // Normal add.
    parent::extensionAdd($name, $data);
    // Load requirements.
    if ($require) {
      $this->wjs->extensionAddRequireArray($this->type, $name, $require);
    }
  }

  /**
   * Get content of WebCom. HTML file is loaded,
   * image links are parsed, CSS and JS requirements
   * are added as normal extensions.
   */
  function extensionPush($name, $options = array(), $value = NULL) {
    $value = $this->valuePush($name, $value);
    if (!$this->valueIsError($value)) {
      if (is_dir($value['server'])) {
        // Search for a json file.
        $json = $value['server'] . '/' . $name . '.json';
        if (is_file($json)) {
          $conf  = json_decode(file_get_contents($json), JSON_FORCE_OBJECT);
          $value = array_merge($value, $conf);
        }
        // Html can come from outside.
        $html = $this->htmlLoad($name, $options, $value);
        if ($html) {
          $value['html'] = $html;
        }
        // Set dom value.
        // Search for extra css file,
        // but first search for a min.css version.
        if ($this->requireCssLinks) {
          $cssPath = realpath($value['server']) . '/' . $name;
          // Loads css or min.css
          $this->wjs->requireLinksClassFile($cssPath . '.css', 'css', $this->type, $name);
        }
        if ($this->requireJsLinks) {
          // Search for extra js file.
          $this->wjs->requireLinksClassFile(realpath($value['server']) . '/' . $name . '.js', 'js', $this->type, $name);
        }
        // Remove unsafe data.
        unset($value['server']);
      }
    }
    // Save value as true.
    return parent::extensionPush($name, $options, $value);
  }

  function htmlLoad($name, $options = array(), $value = array()) {
    $value    = $this->valuePush($name);
    $htmlFile = $value['server'] . '/' . $name . '.html';
    if (is_file($htmlFile)) {
      return $this->htmlParse($name, file_get_contents($htmlFile));
    }
    return FALSE;
  }

  function htmlParse($name, $html) {
    $value = $this->valuePush($name);
    // Rebase links / images to web component folder.
    $html = $this->wjs->htmlRebase($html, $value['client']);
    $this->wjs->htmlParseIncludeRequire($html, $this->type, $name, array(), TRUE);
    return $html;
  }

  /**
   * Register WebCom from a folder content.
   */
  function scanFolderItem($directory, $item, $globalData) {
    if (is_dir($directory . $item)) {
      // Append global data.
      $this->wjs->extensionAdd($this->type, $item, $directory . $item . '/', $globalData);
    }
  }

  function urlHistoryLoad() {
    if (isset($_GET, $_GET[$this->type])) {
      foreach ($_GET[$this->type] as $item) {
        $this->wjs->import($this->type, $item);
      }
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
