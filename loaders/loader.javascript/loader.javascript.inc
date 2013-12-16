<?php

class loader_javascript extends loader {
  function output_append($name) {
    $script = file_get_contents($this->items[$name]);
    // Get list of @require function.
    // Search for all "@require type > name" into script and add it to the output array.
    foreach ($this->wjs->collections_loaders as $type => $loader) {
      // Include required scripts into returned package.
      preg_match_all("`@require " . $type . "(.*)>(.*)`", $script, $results);
      // Requires found.
      if (!empty($results[2])) {
        // Load required collections.
        foreach ($results[2] as $key => $import) {
          // Save trimmed name.
          $this->wjs->output_append($type, trim($import));
        }
      }
    }

    $this->output[$name]['content'] = 'function(){' . $script . '}';
  }
}
