<?php

class loader_jquery extends loader {

  function output_append($name) {
    $this->output[$name]['content'] = 'function(){' . file_get_contents($this->items[$name]) . '}';
  }

}

