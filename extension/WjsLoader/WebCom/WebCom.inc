<?php

namespace Wjs5\Loader;

use \Wjs5\Loader;

/**
 * @package Wjs5\Loader
 */
class WebCom extends Loader {
  var $allowRequireJs = TRUE;

  /**
   * Register WebCom from a folder content.
   */
  function scanFolderItem($directory, $item, $globalData) {
    if (is_dir($directory . $item)) {
      $directory .= $item . '/';
      // Append global data.
      return $this->w->extensionAdd($this->type, $item, $directory, array(), $directory . '.wex');
    }
  }

  function urlHistoryLoad() {
    if (isset($_GET, $_GET[$this->type])) {
      foreach ($_GET[$this->type] as $item) {
        $this->w->extensionPush($this->type, $item);
      }
    }
  }

  function query($group) {
    if (isset($_GET, $_GET[$this->type], $_GET[$this->type][$group])) {
      $this->w->import($this->type, $_GET[$this->type][$group]);
      return TRUE;
    }
    return FALSE;
  }
}
namespace Wjs5\Loader\WebCom;

class Extension extends \Wjs5\Extension {
  var $serverPath;
  var $clientPath;
  var $requireCssLinks = TRUE;
  var $requireJsLinks = TRUE;
  var $htmlFile;
  var $html;
  var $dom;

  function add($settings) {
    // If data is only string it's should be the path of
    // server folder, who contains a .conf ini file.
    if (is_string($settings)) {
      $this->serverPath = $settings;
    }
    else {
      $this->serverPath = $settings['serverPath'];
    }
    // Build client path to extension.
    if (!isset($settings['clientPath'])) {
      // Define path according w.
      // Server path may be a symlink.
      $this->clientPath = $this->w->clientPath($this->serverPath);
    }
    else {
      $this->clientPath = $settings['clientPath'];
    }
    $this->htmlFile = $this->extensionFileTypeExists('html');
    // Load sub extensions
    $extension = $this->serverPath . 'extension/';
    if (is_dir($extension)) {
      $this->w->scanFolderExtensions($extension);
    }
  }

  function push() {
    // Search for a css file.
    if ($this->requireCssLinks) {
      $this->requireLinkFile('css');
    }
    // Search for a js file.
    if ($this->requireJsLinks) {
      // Adding link will parse it for @require tags.
      $this->requireLinkFile('js');
    }
    if ($this->htmlFile) {
      $this->html = file_get_contents($this->htmlFile);
      // Rebase links / images to web component folder.
      $this->html = $this->w->htmlRebase($this->html, $this->clientPath);
      // Create a dom object.
      $this->dom = $this->w->htmlLoad($this->html);
      // Iterates to search for includes, return converted html.
      $this->htmlParseDom($this->dom);
    }
  }

  /**
   * Get content of WebCom. HTML file is loaded,
   * image links are parsed.
   */
  function instance($options) {
    return array(
      'clientPath' => $this->clientPath,
      // Replacement of include tags is made during page rendering.
      'html' => isset($options['html']) ? $options['html'] : $this->html
    );
  }

  function output($data = NULL) {
    return parent::output(current($this->instances));
  }

  function htmlLoad($name) {
    return $this->html;
  }

  function htmlParseDom(\DOMNode $dom) {
    $output = array();
    /* @var \DOMElement $domNode */
    foreach ($dom->childNodes as $domNode) {
      // Item may be text.
      if ($domNode instanceof \DOMElement) {
        // Attribute names are lowercase.
        if ($domNode->hasAttribute('data-wjsinclude')) {
          // Get type / name.
          list($includedType, $includedName) = explode(':', $domNode->getAttribute('data-wjsinclude'));
          // Save for output.
          $output[$includedType][] = $includedName;
          $this->w->extensionAddRequire(
            $this->extensionType,
            $this->extensionName,
            $includedType,
            $includedName, array(
              'includeWebCom' => $this,
              'includeDom'    => $domNode
            )
          );
        }
        else {
          $output = array_merge_recursive($output, $this->htmlParseDom($domNode));
        }
      }
    }
    return $output;
  }

  /**
   * Load a CSS or JS file as an extension dependency.
   *
   * @param $fileType
   */
  function requireLinkFile($fileType) {
    // Search for extra js file.
    $this->w->extensionsAddLink($this->serverPath . '/' . $this->extensionName . '.' . $fileType, $fileType, $this->extensionType, $this->extensionName);
  }
}
