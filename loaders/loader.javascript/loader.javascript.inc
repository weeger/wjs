<?php

namespace wjs\loader;

/**
 * Class javascript
 * Transmit javascript to wjs. Wrap it into a function.
 * @package wjs\loader
 */
class javascript extends \wjs\loader {
  var $inc = __FILE__;

  function output_append($name, $path = FALSE, $package = array()) {
    // Path can be specified to define specific file to parse,
    // especially for subclasses, but by default we use
    // path saved as item value.
    $path = ($path === FALSE) ? $this->items[$name] : $path;
    if (!is_file($path)) {
      return 'ERR_JAVASCRIPT_FILE_NOT_FOUND : ' . $path;
    }
    return $this->javascript_file_pack($path);
  }

  /**
   * Output wrap is set into an independent function
   * to allow subclasses to override it, like json loader.
   *
   * @param $script
   *
   * @return string
   */
  function output_wrap($script) {
    return 'function(){' . $script . '}';
  }

  function javascript_file_pack($path, $data_type = 'javascript') {
    return $this->javascript_string_pack(file_get_contents($path), $data_type);
  }

  /**
   * Parse javascript string and load extra files defined in code
   * by a "@require type > name" statement.
   *
   * @param        $script
   * @param string $data_type
   *
   * @return array
   */
  function javascript_string_pack($script, $data_type = 'javascript') {
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
      $data_type => $this->output_wrap($script),
    );
    // Mark item as loaded if data type differ than default type,
    // this will launch parse_[item_type]() into javascript loader.
    if ($this->type !== $data_type) {
      $package[$this->type] = TRUE;
    }
    //
    if (!empty($required)) {
      $package['#require'] = $required;
    }
    return $package;
  }
}
