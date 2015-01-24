<?php

namespace Wjs\Loader;

use \Wjs\Loader;

/**
 * @package Wjs\Loader
 */
class WebComp extends Loader {

  function extensionAdd($name, $data) {
    $require = FALSE;
    // Build data from json.
    $data = $this->dataBuild($name, $data);
    // Temporary disable requirements.
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

  function extensionPush($name, $excludeRequire = FALSE, $value = NULL) {
    $value = $this->valuePush($name, $value);
    if ($value !== WJS_ERR_PUSH_UNDEFINED_EXTENSION) {
      $data = '';
      if (is_dir($value['server'])) {
        $data            = array(
          // By default destination is not defined.
          'destination' => isset($value['destination']) ? $value['destination'] : FALSE,
          // If no html file defined, use an empty string.
          'html'        => (is_file($value['server'] . $name . '.html')) ? file_get_contents($value['server'] . $name . '.html') : '',
          // Define if url query strings are updated on WebComp load.
          'urlUpdate'   => isset($value['urlUpdate']) ? $value['urlUpdate'] : FALSE,
          // We can choose to display only one WebComp of each group at a time.
          'group'       => isset($value['group']) ? $value['group'] : FALSE,
        );
        $value['client'] = isset($value['client']) ? $value['client'] : $this->wjs->pathClientRelative($value['server']);
        if ($data['html'] !== '') {
          // Parse with native PHP dom parser.
          $dom = new \DOMDocument;
          // Remove errors like parsing non encoded question marks in urls.
          libxml_use_internal_errors(TRUE);
          // We need to add main wrappers around our document content.
          $wrapped = '<div>' . $data['html'] . '</div>';
          $domSave = NULL;
          // Load depending of PHP version.
          $php54 = (version_compare(PHP_VERSION, '5.4.0') >= 0);
          if ($php54) {
            $dom->loadHTML($wrapped, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
          }
          // Version under PHP 5.4 do not support second argument in loadHTML,
          // so we have to remove manually
          else {
            $dom->loadHTML($wrapped);
            // Remove doctype.
            $dom->removeChild($dom->doctype);
            // Search for our div through html / body tags.
            $dom->replaceChild($dom->firstChild->firstChild->firstChild, $dom->firstChild);
          }
          // Replace images src.
          $images = $dom->getElementsByTagName('img');
          /** @var \DOMElement $image */
          foreach ($images as $image) {
            $src = $image->getAttribute('src');
            // Relocate images from extensions location.
            if (substr($src, 0, 4) !== 'http') {
              $image->setAttribute('src', $value['client'] . $image->getAttribute('src'));
            }
          }
          // Convert to text.
          $data['html'] = $dom->saveHTML();
          // Remove the temporary wrapper.
          $data['html'] = trim(preg_replace('!^<div>([\s\S]*?)</div>$!i', '$1', $data['html']));
        }
        if (is_file($value['server'] . $name . '.css')) {
          $LinkName = $value['client'] . $name . '.css';
          $this->wjs->extensionAdd('CssLink', $LinkName, $LinkName);
          $this->wjs->extensionAddRequire($this->type, $name, 'CssLink', $LinkName);
        }
        if (is_file($value['server'] . $name . '.js')) {
          $LinkName = $value['client'] . $name . '.js';
          $this->wjs->extensionAdd('JsLink', $LinkName, $LinkName);
          $this->wjs->extensionAddRequire($this->type, $name, 'JsLink', $LinkName);
          $this->wjs->jsParseRequire($this->type, $name, file_get_contents($value['server'] . $name . '.js'));
        }
      }
      $value = $data;
    }
    // Save value as true.
    return parent::extensionPush($name, $excludeRequire, $value);
  }

  function dataBuild($name, $data, $dataExtra = NULL) {
    static $cache = array();
    if (!isset($cache[$name])) {
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
        $data['client'] = $this->wjs->pathClientRelative($data['server']);
      }
      $cache[$name] = $data;
    }
    // Append extra data.
    if ($dataExtra) {
      $cache[$name] = array_merge($cache[$name], $dataExtra);
    }
    return $cache[$name];
  }

  /**
   * Register WebComp from a folder content.
   */
  function scanFolderItem($directory, $item, $globalData) {
    if (is_dir($directory . $item)) {
      // Append global data.
      $data = $this->dataBuild($item, $directory . $item . '/', $globalData);
      $this->wjs->register($this->type, $item, $data);
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
