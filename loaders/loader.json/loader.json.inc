<?php

class loader_json extends loader {

  function output_append($name) {
    we_javascript_output_array('json', $name);
  }

  function item_pack($type, $name, $script) {
    switch ($type) {
      // Default file is javascript.
      case 'json':
        return $script;
        break;
    }
  }
}
