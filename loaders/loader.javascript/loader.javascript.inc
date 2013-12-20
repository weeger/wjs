<?php

class loader_javascript extends loader {
  var $dir = __FILE__;
  function __construct($type, $wjs) {
    parent::__construct($type,$wjs);
  }
  function output_append($name) {
    if (!is_file($this->items[$name])) {
      return 'Not found : ' . $this->items[$name];
    }
    $script = file_get_contents($this->items[$name]);
    $required = array();
    // Get list of @require function.
    // Search for all "@require type > name" into script and add it to the output array.
    foreach ($this->wjs->collections_loaders as $type => $loader) {
      // Include required scripts into returned package.
      preg_match_all("`@require " . $type . "(.*)>(.*)`", $script, $results);
      // Requires found.
      if (!empty($results[2])) {
        // Load required collections.
        foreach ($results[2] as $import) {
          $import = trim($import);
          // Save trimmed name.
          $this->wjs->output_append($type, $import);
          $required[$type][] = $import;
        }
      }
    }
    // Wrap script into function.
    $package = array(
      $this->type => $this->output_wrap($script),
    );
    //
    if (!empty($required)) {
      $package['#require'] = $required;
    }
    return $package;
  }

  function output_wrap($script) {
    return 'function(){' . $script . '}';
  }

}
