<?php

namespace Wjs\Loader;

use \Wjs\Loader;

/**
 * @package Wjs\Loader
 */
class WebComp extends Loader {

  function extensionAdd($name, $data) {
    $require = FALSE;
    // If data is only string it's should be the path of
    // server folder, who contains a .conf ini file.
    if (!is_array($data)) {
      $conf = $data . $name . '.json';
      if (is_file($conf)) {
        $conf           = json_decode(file_get_contents($conf), JSON_FORCE_OBJECT);
        $conf['server'] = $data;
      }
      $data = $conf;
      if (isset($data['require'])) {
        $require = $data['require'];
        unset($data['require']);
      }
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
      if (is_file($value['server'] . $name . '.html')) {
        $data = array(
          'destination' => $value['destination'],
          'html'        => file_get_contents($value['server'] . $name . '.html')
        );
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
    // Save value as true.
    return parent::extensionPush($name, $excludeRequire, $data);
  }
}
