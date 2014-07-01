<?php

namespace wjs;

/**
 * Class transcode are used as base constructor to allow
 * object to be converted into other languages, basically
 * from PHP to Javascript. It also manage several paths
 * to define client / server roots and other custom
 * locations. This way, it maintain stability of the same
 * object between different environments.
 * @package wjs
 */
class transcode {
  // List of required paths by constructor.
  var $paths_required = array();
  // Store data able to be converted in this variable.
  var $transcoded_data = array(
    'server' => array(
      'paths' => array(
        'root' => ''
      )
    ),
    'client' => array(
      'paths' => array(
        'root' => ''
      )
    ),
  );

  /**
   * Construct object with predefined paths,
   * paths_required allow to specify which path
   * is expected on construction.
   *
   * @param paths
   */
  function __construct($paths) {
    // Allow to set paths to null.
    $paths = $paths === NULL ? array() : $paths;
    // Search for unfilled paths.
    foreach ($this->paths_required as $side => $paths_required) {
      if (!isset($paths[$side])) {
        trigger_error('wjs transcode error : Missing paths side : ' . $side . ' for ' . get_class($this), E_USER_ERROR);
      }
      else if ($paths_required !== (array_intersect($paths_required, array_keys($paths[$side])))) {
        trigger_error('wjs transcode error : Missing constructor paths arguments : ' . $side . ' > ' . implode(',', array_diff($paths_required, array_keys($paths[$side]))), E_USER_ERROR);
      }
    }
    // Use common method to save multiple paths.
    $this->paths($paths);
  }

  /**
   * Set / Get a variable into the exportable
   * data for other languages.
   *
   * @param      $side
   * @param      $name
   * @param null $value
   *
   * @return mixed
   */
  function transcoded_variable($side, $name, $value = NULL) {
    if ($value !== NULL) {
      $this->transcoded_data[$side][$name] = $value;
    }
    return $this->transcoded_data[$side][$name];
  }

  /**
   * Return value of a path without value of root path prepended.
   * It may be useful to transmit path to other constructor arguments
   * or to retrieve value of a path.
   *
   * @param side
   * @param name
   *
   * @returns bool|string
   */
  function path_raw($side, $name) {
    // Paths as saved as basic transcoded variable.
    $paths = $this->transcoded_variable($side, 'paths');
    return isset($paths[$name]) ? $paths[$name] : FALSE;
  }

  /**
   * Set value of a path. Root path is a special case
   * who define base path for all others one in each
   * sides (client / or server).
   * Return value of a path with root path prepended.
   *
   * @param      $side
   * @param      $name
   * @param null $value
   *
   * @return bool|string
   */
  function path($side, $name, $value = NULL) {
    // Save as a transcoded variable.
    $paths = $this->transcoded_variable($side, 'paths');
    if ($value !== NULL) {
      $paths[$name] = $value;
      $this->transcoded_variable($side, 'paths', $paths);
    }
    // Return requested path if exists.
    $path_raw = $this->path_raw($side, $name);
    if ($path_raw !== FALSE) {
      // Append root path.
      return ($name !== 'root' ? $paths['root'] : '') . $path_raw;
    }
    return FALSE;
  }

  /**
   * Convert windows backslashes into paths to
   * normal slashes. It may pose problems when
   * paths are exported to client side
   * (not supported by firefox in URLs).
   *
   * @param string $path
   *
   * @return string
   */
  function path_cleanup($path) {
    return str_replace('\\', '/', $path);
  }


  /**
   * @param $subtract
   * @param $from
   *
   * @return string
   */
  function path_subtract($subtract, $from) {
    $path = trim($this->path_cleanup(substr(realpath($subtract), strlen(realpath($from)) + 1)));
    // Add end slash if subfolder exists
    return ($path !== '') ? $path . '/' : $path;
  }

  /**
   * Save multiple paths in one time.
   *
   * @param      $side
   * @param null $paths
   *
   * @return array|null
   */
  function paths($side, $paths = NULL) {
    if (is_array($side)) {
      foreach ($side as $key => $paths) {
        $this->paths($key, $paths);
      }
      return NULL;
    }
    // Set paths.
    if ($paths !== NULL) {
      foreach ($paths as $name => $value) {
        $this->path($side, $name, $value);
      }
    }
    // Get paths.
    else {
      $output = array();
      foreach ($this->transcoded_variable($side, 'paths') as $name => $value) {
        $output[$name] = $this->path($side, $name);
      }
      return $output;
    }
  }

  /**
   * Convert exportable data into expected format.
   * Use internal named function for specific conversions.
   * @return mixed
   */
  function convert() {
    $args   = func_get_args();
    $format = array_shift($args);
    $method = 'convert_to_' . $format;
    if (method_exists($this, $method)) {
      return call_user_func_array(array($this, $method), $args);
    }
    else {
      trigger_error('wjs transcode error : Trying to export unsupported format ' . $format);
    }
  }

  /**
   * Return data as an array.
   * This ma be used to convert data by
   * others scripts.
   * @return array
   */
  function convert_to_array() {
    $data = $this->transcoded_data;
    unset($data['server']);
    // Client path root should be used as a global variable.
    // We remove empty variable too to reduce useless arguments.
    // This part may be fully enhanced in the future.
    unset($data['client']['paths']['root']);
    if (empty($data['client']['paths'])) {
      unset($data['client']['paths']);
    }
    if (empty($data['client'])) {
      unset($data['client']);
    }
    return $data;
  }
}