<?php

namespace Wjs\Loader;

use \Wjs\Loader;

/**
 * @package Wjs\Loader
 */
class WebComp extends Loader {

  function extensionAdd($name, $data) {
    $require = FALSE;
    $data    = $this->dataBuild($name, $data);
    if (isset($data['require'])) {
      $require = $data['require'];
      unset($data['require']);
    }
    parent::extensionAdd($name, $data);
    if ($require) {
      $this->wjs->extensionAddRequireArray($this->type, $name, $require);
    }
  }

  function extensionPush($name, $excludeRequire = FALSE, $value = NULL) {
    $value = $value === NULL ? $this->extensions[$name] : $value;
    $data  = '';
    if (is_dir($value['server'])) {
      $data = array(
        // By default destination is the page body.
        'destination' => isset($value['destination']) ? $value['destination'] : 'body',
        // If no html file defined, use an empty string.
        'html'        => (is_file($value['server'] . $name . '.html')) ? file_get_contents($value['server'] . $name . '.html') : '',
        // Define if url query strings are updated on WebComp load.
        'urlUpdate'   => isset($value['urlUpdate']) ? $value['urlUpdate'] : FALSE,
        // We can choose to display only one WebComp of each group at a time.
        'group'       => isset($value['group']) ? $value['group'] : FALSE,
      );
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
    // Save value as true.
    return parent::extensionPush($name, $excludeRequire, $data);
  }

  function dataBuild($name, $data) {
    static $cache = array();
    // Array are data.
    if (is_array($data)) {
      if (!isset($data['client'])) {
        $data['client'] = $data['server'];
      }
      $cache[$name] = $data;
    }
    // If data is only string it's should be the path of
    // server folder, who contains a .conf ini file.
    elseif (!isset($cache[$name])) {
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
          'client' => $data,
        );
      }
      $cache[$name] = $conf;
    }
    return $cache[$name];
  }

  /**
   * Register WebComp from a folder content.
   * Each subdirectory is considered as a WebComp.
   *
   * @param string $directory The directory to scan with a trailing slash
   * @param array  $globalData
   * @param null   $order
   */
  function scanFolder($directory, $globalData = array(), $order = NULL) {
    $scan = scandir($directory);
    if ($order) {
      $scan = array_merge($order, array_diff($scan, $order));
    }
    foreach ($scan as $item) {
      // Avoid all special folders.
      if ($item{0} !== '.' && is_dir($directory . $item)) {
        // Append global data.
        $data = array_merge($this->dataBuild($item, $directory . $item . '/'), $globalData);
        $this->wjs->register($this->type, $item, $data);
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
