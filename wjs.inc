<?php

class wjs {
  var $ajax_request = FALSE,
    $collections_loaders = array(),
    $path_wjs = '',
    $path_cache = FALSE,
    $cache = TRUE,
    $cache_flush = TRUE,
    $output = FALSE,
    // Loaders JS are appended into
    // core js files via collection_loader_register().
    $js_core_files = array(
    'js/jquery.inherit.js',
    'js/wjs.loader.js',
    'js/wjs.process.js',
    'js/wjs.js',
  ),
    $js_settings = array(
    'path_core' => '',
    'path_response' => 'path_to_response.php',
    'path_cache' => '',
  );

  function __construct($path_wjs, $ajax_request = FALSE) {
    $this->path_wjs = $path_wjs;
    $this->ajax_request = $ajax_request;
    // Use server side library path as the default client core path.
    $this->js_setting('path_core', $this->path_wjs);
    $this->js_setting('path_response', $this->path_wjs . '/response.php');
    // Make js core files relative to wjs path.
    foreach ($this->js_core_files as $key => $path) {
      $this->js_core_files[$key] = $this->path_wjs . '/' . $path;
    }
    require_once $this->path_wjs . '/wjs.loader.inc';
    // Add default loaders.
    $path_loaders = $this->path_wjs . '/loaders';
    $this->collection_loader_register('javascript', $path_loaders);
    $this->collection_loader_register('jquery', $path_loaders);
    $this->collection_loader_register('json', $path_loaders);
  }

  // ............................................... CACHE

  function cache_item_path($collection, $item, $client = FALSE) {
    $pieces = $this->cache_path_info($collection, $client);
    return implode($pieces) . $item . '.js';
  }

  function cache_path_create($collection) {
    $pieces = $this->cache_path_info($collection);
    $base = '';
    while (!empty($pieces)) {
      $base .= array_shift($pieces);
      if (!is_dir($base)) {
        mkdir($base);
      }
    }
  }

  function cache_path_info($collection, $client = FALSE) {
    return array(
      // Use PHP or JS_cache root.
      'cache' => ($client === FALSE) ? $this->path_cache : $this->js_settings['path_cache'],
      'collection' => $collection . '/',
    );
  }

  function package_write($collection, $item, $script) {
    static $cache_enabled = NULL;
    if ($cache_enabled === NULL) {
      $cache_enabled = ($this->cache && $this->path_cache !== FALSE && is_writable($this->path_cache));
    }
    // We can choose to get script as a cached file or directly script content to eval.
    // Using cache is slower and make two queries instead one for non cached data
    // but this method avoid to use eval for javascript content.
    if ($cache_enabled) {
      $file_server = $this->cache_item_path($collection, $item);
      if ($this->cache_flush || !is_file($file_server)) {
        $this->cache_path_create($collection);
        // Write out file, and place data into a callback of loader.
        $package_content = array();
        foreach ($script as $key => $content) {
          $package_content[] = '"' . $key . '":' . ((is_array($content) || is_object($content)) ? json_encode($content) : $content);
        }
        $package = implode(',', $package_content);
        file_put_contents($file_server, 'window.w.loader("' . $collection . '").parse("' . $item . '",{' . $package . '});');
      }
      // Return client side file path.
      return 'cache://' . $this->cache_item_path($collection, $item, TRUE);
    }
    else {
      return $script;
    }

  }

  // ............................................... COLLECTION

  function collection_loader_register($name, $path) {
    // Directory must be named loader.[name].
    $files_pattern = $path . '/loader.' . $name . '/loader.' . $name;
    // Directory must contain two files :
    //   - loader.[name].inc : Containing PHP class
    //   - loader.[name].js : Containing Js class
    if (is_file($files_pattern . '.inc') && is_file($files_pattern . '.js')) {
      // Load PHP class definition.
      require_once $files_pattern . '.inc';
      $class_name = 'loader_' . $name;
      $this->collections_loaders[$name] = new $class_name($name, $this);
      // Add javascript into core files.
      $this->js_core_files[] = $files_pattern . '.js';
    }
  }

  function collection_item_register($type, $name, $path) {
    $this->collections_loaders[$type]->item_register($name, $path);
  }

  // ............................................... OUTPUT

  function output_append($type, $name) {
    if (isset($this->collections_loaders[$type]) && isset($this->collections_loaders[$type]->items[$name])) {
      $this->output[$type][$name] = $this->package_write($type, $name, $this->collections_loaders[$type]->output_append($name));
    }
  }

  // ............................................... JS

  function js_setting($name, $value = FALSE) {
    if ($value !== FALSE) {
      $this->js_settings[$name] = $value;
    }
    return (isset($this->js_settings[$name])) ? $this->js_settings[$name] : FALSE;
  }

  /**
   * Return packed JS data to execute on page startup.
   */
  function js_package() {
    return ($this->output) ? json_encode($this->output) : 'No collection or item found';
  }

  function js_unpacker() {
    // Send list of jQuery plugins.
    if (isset($this->collections_loaders['jquery'])) {
      $this->js_setting('jquery_plugins', array_keys($this->collections_loaders['jquery']->items));
    }
    $output_json = array();
    // Add settings.
    $output_json[] = 'settings:' . json_encode($this->js_settings);
    // Add loaders types.
    $output_json[] = 'core_loaders:' . json_encode(array_keys($this->collections_loaders));
    // Load functions and class called in server side for this page.
    $output_json[] = 'default_package:' . $this->js_package();
    // Add object brackets.
    $output = '{' . implode(',', $output_json) . '}';
    // Launch Javascript init function containing startup data.
    return 'w.init(' . $output . ');';
  }

  function js_header() {
    $output = '';
    foreach ($this->js_core_files as $file) {
      $output .= '<script type="text/javascript" src="' . $file . '"></script>';
    }
    return $output;
  }

  /**
   * Footer should be at the end of page to let other scripts
   * adds some action into w.ready().
   */
  function js_footer() {
    // Get javascript unpacker.
    $js = $this->js_unpacker();
    // Wrap into scripts tags to insert into html page.
    return ($js !== '') ? '<script type="text/javascript">jQuery(function(){' . $js . '});</script>' : '';
  }

}