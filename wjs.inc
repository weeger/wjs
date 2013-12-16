<?php

class wjs {
  var $ajax_request = FALSE,
    $collections_loaders = array(),
    $collections_items = array(),
    $path_wjs = '';
  var $js_core_files = array(
    'js/jquery.inherit.js',
    'js/wjs.loader.js',
    'js/wjs.process.js',
    'js/wjs.js',
  );
  var $js_settings = array(
    'path_core' => ''
  );

  function __construct($path_wjs) {
    $this->path_wjs = $path_wjs;
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

  function js_setting($name, $value) {
    $this->js_settings[$name] = $value;
  }

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
      $this->collections_loaders[$name] = new $class_name;
      $this->collections_loaders[$name]->wjs = $this;
      // Add javascript into core files.
      $this->js_core_files[] = $files_pattern . '.js';
      // Load js file as a javascript file.
//      $this->collection_item_register('javascript', 'loader.' . $name, $files_pattern . '.js');
    }
  }

  function collection_item_register($type, $name, $path) {
    $this->collections_loaders[$type]->items[$name] = $path;
  }

  function output_append($type, $name) {
    $this->collections_loaders[$type]->output_append($name);
  }

  /**
   * Return packed JS data to execute on page startup.
   */
  function js_package() {
    $package = array();

    foreach ($this->collections_loaders as $type => $loader) {
      // Inspect each collection item.
      $package_collection = array();
      // Create JSON manually.
      // We not use json_encode in order to use
      // hook_pack for loader and do not encode
      // twice loaded scripts like javascript.
      foreach ($loader->output as $name => $output) {
        $package_collection[$name] = '"' . $type . '":' . $output['content'];
//        if (isset($item->require)) {
//          $package_collection[$item_name] .= ',"#require":' . json_encode($item->require);
//        }
//        if (isset($item->files)) {
//          $package_extra = array();
//          foreach ($item->files as $extra_type => $extra_group) {
//            $package_file = array();
//            foreach ($extra_group as $extra_name => $extra) {
//              $package_file[$extra_name] = '"' . $extra_name . '":' . $loader->item_pack($extra_type, $extra_name, $extra->content);
//              if (isset($extra->require)) {
//                $package_file[$extra_name] .= ',"#require":' . json_encode($extra->require);
//              }
//            }
//            $package_extra[] = '"' . $extra_type . '":{' . implode(',', $package_file) . '}';
//          }
//          $package_collection[$item_name] .= ',' . implode(',', $package_extra);
//        }
        $package_collection[$name] = '"' . $name . '":' . '{' . $package_collection[$name] . '}';
      }
      $package[] = '"' . $type . '":{' . implode(',', $package_collection) . '}';
    }

    if (!empty($package)) {
      // Join package data.
      $output_json = '{' . implode(',', $package) . '}';
      return $output_json;
    }

    return '{}';
  }

  function js_unpacker() {
    // Send list of jQuery plugins.
    if (isset($this->collections_loaders['jquery'])) {
      $this->js_setting('jquery_plugins', array_keys($this->collections_loaders['jquery']->items));
    }
    // Gather outputs.
    $this->output = array();
    foreach ($this->collections_loaders as $type => $loader) {
      $this->output[$type] = $loader->output;
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
    return $output . $this->js_init();
  }

  function js_init() {
    // Get javascript unpacker.
    $js = $this->js_unpacker();
    // Wrap into scripts tags to insert into html page.
    return ($js !== '') ? '<script type="text/javascript">jQuery(function(){' . $js . '});</script>' : '';
  }
}