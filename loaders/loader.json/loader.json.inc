<?php

class loader_json extends loader_javascript {
  var $dir = __FILE__;

  function output_wrap($script) {
    // Decode content to merge it with output json.
    // In other case, content will be transmitted as a string.
    return json_decode($script);
  }
}
