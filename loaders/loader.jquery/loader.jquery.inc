<?php

class loader_jquery extends loader_javascript {
  function __construct($name, $wjs) {
    parent::__construct($name, $wjs);
    $this->wjs->js_setting('jquery_plugins', array());
  }

  function item_register($name, $path) {
    parent::item_register($name, $path);
    // Append plugin to list.
    // We need to use a var for array_push.
    $plugins = $this->wjs->js_setting('jquery_plugins');
    array_push($plugins, $name);
    $this->wjs->js_setting('jquery_plugins', $plugins);
  }
}

