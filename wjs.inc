<?php

define('WJS_PATH_ROOT', str_replace('\\', '/', dirname(__FILE__)) . '/');
define('WJS_VERSION', '2.6.9');

require_once WJS_PATH_ROOT . 'wjs.transcode.inc';
require_once WJS_PATH_ROOT . 'wjs.loader.inc';
require_once WJS_PATH_ROOT . 'wjs.library.inc';

class wjs extends \wjs\transcode {
  /**
   * Contain loaders objects.
   * @var array $collections_loaders
   */
  var $collections_loaders = array();
  /**
   * Contain items to add to collection loader if
   * this not exists at the item registration.
   * Items will be added automatically on the loader
   * registration, and this array will be entry.
   * @var array
   */
  var $collections_loaders_items_cache = array();
  /**
   * Specify to use cached content,
   * cache directory must be known.
   * @var bool $cache
   */
  var $cache = TRUE;
  /**
   * Specify to flush cached
   * content if cache is enabled.
   * @var bool $cache_flush
   */
  var $cache_flush = TRUE;
  /**
   * Contain data to transmit
   * to wjs javascript object.
   * @var bool $output
   */
  var $output = FALSE;
  /**
   * Store patterns masks to
   * use on directories scans.
   * @var array $patterns
   */
  var $patterns = array();
  /**
   * Contain list of core files, used to complete list
   * of output js files list. Core files can differ from
   * wjs versions, public version have core file aggregated
   * into one file into the library root.
   * @var array $js_core_files
   */
  var $js_core_files = array(
    'master' => array(
      // Minified version
      'wjs.packed.min.js',
    ),
    'source' => array(
      'js/wjs.js',
      'js/wjs.transcode.js',
      'js/wjs.loader.js',
      'js/wjs.process.js',
    ),
  );
  /**
   * Define which js files to use.
   * @var string $js_core_files_version
   */
  var $js_core_files_version = 'master';
  /**
   * Contain list of core loaders which
   * are automatically added to wjs.
   * @var array $loaders_core
   */
  var $loaders_core = array(
    'javascript',
    'javascript_link',
    'css_link',
    'json',
  );
  /**
   * Contain list of transcode ready
   * to be exported.
   * @var array
   */
  var $output_transcode = array();
  /**
   * Contain groups of items, used as shortcuts
   * to append multiple items in one time. Groups
   * are basically used by libraries.
   * @var array
   */
  var $output_group = array();
  /**
   * Queue groups to add to output, used by libraries.
   * Default groups should be added once before using
   * js_package by using output_group_append_default().
   * It prevent to return undesired content automatically.
   * @var array
   */
  var $library_output_group_default = array();
  var $transcode_class_name = 'wjs';
  var $paths_required = array(
    'server' => array(
      'root',
      'wjs',
    ),
    'client' => array(
      'root',
      // Response path should be customized,
      // to define some security parameters
      // when receiving queries and retrieving
      // data, depending of site configuration.
      'wjs_response'
    )
  );

  function __construct($paths) {
    // Force wjs path, path server root is required, so we
    // suggest that wjs is into the same folder as sites root.
    if (!isset($paths['server']['wjs'])) {
      $paths['server']['wjs'] = $this->path_subtract(WJS_PATH_ROOT, $paths['server']['root']);
    }
    parent::__construct($paths);
    // If not specified, use server path to define factory client path.
    if ($this->path('client', 'wjs') === FALSE) {
      $this->path('client', 'wjs', $this->path_raw('server', 'wjs'));
    }
    // Add default loaders.
    $path_loaders = $this->path('server', 'wjs') . '/loaders';
    foreach ($this->loaders_core as $name) {
      $this->collection_loader_register($name, $path_loaders);
    }
    // Add default patterns.
    $this->collection_item_pattern('javascript', '`^(.*).js$`');
    // Append itself to transcodes output.
    $this->output_append_transcode($this, 'wjs');
  }

  function cache_item_path($collection, $item, $client = FALSE) {
    $pieces = $this->cache_path_info($collection, $client);
    return implode($pieces) . $item . '.js';
  }

  function cache_path_create($collection) {
    $pieces = $this->cache_path_info($collection);
    $base   = '';
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
      'cache'      => $this->path((($client === FALSE) ? 'client' : 'server'), 'cache'),
      'collection' => $collection . '/',
    );
  }

  function package_write($collection, $item, $script) {
    static $cache_enabled = NULL;
    if ($cache_enabled === NULL) {
      $cache_enabled = ($this->cache && $this->path('client', 'cache') !== FALSE && is_writable($this->path('client', 'cache')));
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

  function collection_loader_register($name, $path, $js_file = TRUE) {
    // Directory must be named loader.[name].
    $files_name    = 'loader.' . $name;
    $files_pattern = $path . '/' . $files_name . '/' . $files_name;
    // Directory must contain at least one PHP file :
    //   - loader.[name].inc : Containing PHP class
    // The JS loader must exists, but file can be declared
    // from another source.
    //   - loader.[name].js : Containing Js class
    if (!is_file($files_pattern . '.inc')) {
      trigger_error('wjs error : missing ' . $files_pattern . '.inc file for loader ' . $name, E_USER_ERROR);
    }
    else {
      // Load PHP class definition.
      require_once $files_pattern . '.inc';
      $class_name                       = '\wjs\loader\\' . $name;
      $this->collections_loaders[$name] = new $class_name(NULL, $name, $this, $js_file);
      // Add items saved into cache before loader registration.
      if (isset($this->collections_loaders_items_cache[$name])) {
        foreach ($this->collections_loaders_items_cache[$name] as $item_name => $item_path) {
          $this->collection_item_register($name, $item_name, $item_path);
        }
        unset($this->collections_loaders_items_cache[$name]);
      }
    }
  }

  /**
   * @param $name
   *
   * @return \wjs\loader
   */
  function collection_loader_get($name) {
    return $this->collections_loaders[$name];
  }

  function collection_item_register($type, $name, $path) {
    if (!isset($this->collections_loaders[$type])) {
      if (!isset($this->collections_loaders_items_cache[$type])) {
        $this->collections_loaders_items_cache[$type] = array();
      }
      $this->collections_loaders_items_cache[$type][$name] = $path;
    }
    else {
      $this->collection_loader_get($type)->item_register($name, $path);
    }
  }

  function collection_item_register_output($type, $name, $path) {
    $this->collection_item_register($type, $name, $path);
    $this->output_append($type, $name);
  }

  function collection_item_pattern($type, $pattern) {
    $this->patterns[$type] = is_array($pattern) ? $pattern : array('file' => $pattern);
  }

  function collection_item_pattern_scan_directory($directory, $type = NULL) {
    // Type as an array is a list of multiple types.
    if (is_array($type)) {
      foreach ($type as $type_entry) {
        $this->collection_item_pattern_scan_directory($directory, $type_entry);
      }
      return;
    }
    // Adding undefined pattern throw an error.
    if (!isset($this->patterns[$type])) {
      trigger_error('wjs error : trying to detect undefined item pattern ' . $type, E_USER_ERROR);
    }
    // Scanning a missing directory throw an error.
    if (!is_dir($directory)) {
      trigger_error('wjs error : trying to scan missing directory : ' . $directory, E_USER_ERROR);
    }
    // Normalize directory path.
    $directory = realpath($directory);
    // Remove all hidden files ("." && "..").
    $scan = array_values(preg_grep('/^([^.])/', scandir($directory)));
    foreach ($scan as $item) {
      $results = array();
      preg_match($this->patterns[$type]['file'], $item, $results);
      if (isset($results[1])) {
        $this->collection_item_register($type, $results[1], $directory . '/' . $item);
      }
    }
  }

  function library_append(\wjs\library $library) {
    $this->output_group = array_merge_recursive($this->output_group, $library->output_group);
    $this->library_append_loader($library);
    $this->library_append_item($library);
    $this->library_append_pattern($library);
    $this->library_append_directory($library);
    $this->library_output_group_default = array_merge($this->library_output_group_default, $library->output_group_default);
  }

  function library_append_loader(\wjs\library $library) {
    foreach ($library->collection_loader as $loader => $directory) {
      $this->collection_loader_register($loader, $library->dir . '/' . $directory);
    }
  }

  function library_append_item(\wjs\library $library) {
    foreach ($library->collection_item as $type => $items) {
      foreach ($items as $name => $path) {
        $this->collection_item_register($type, $name, $library->dir . '/' . $path);
      }
    }
  }

  function library_append_pattern(\wjs\library $library) {
    foreach ($library->collection_item_pattern as $item => $options) {
      $this->collection_item_pattern($item, $options);
    }
  }

  function library_append_directory(\wjs\library $library) {
    foreach ($library->collection_item_pattern_directory as $subdirectory => $options) {
      $this->collection_item_pattern_scan_directory($library->dir . '/' . $subdirectory, $options);
    }
  }

  function output_append($type, $name) {
    if (isset($this->collections_loaders[$type]) && isset($this->collection_loader_get($type)->items[$name])) {
      $this->output[$type][$name] = $this->package_write($type, $name, $this->collection_loader_get($type)->output_append($name));
    }
  }

  function output_group_append($group) {
    if ($this !== NULL && isset($this->output_group[$group])) {
      foreach ($this->output_group[$group] as $type => $items) {
        foreach ($items as $item) {
          $this->output_append($type, $item);
        }
      }
    }
  }

  /**
   * Append defaults groups, specified by external libraries.
   */
  function output_group_append_default() {
    foreach ($this->library_output_group_default as $group) {
      $this->output_group_append($group);
    }
  }

  function output_append_transcode(\wjs\transcode $transcode, $transcode_id = NULL) {
    $class_name = get_class($transcode);
    // If not specified, use class name as id
    // object should have only one instance.
    $transcode_id = $transcode_id === NULL ? $class_name : $transcode_id;
    if (!isset($this->output_transcode[$class_name])) {
      $this->output_transcode[$class_name] = array();
    }
    $this->output_transcode[$class_name][$transcode_id] = $transcode;
  }

  /**
   * Return packed JS data to execute on page startup.
   */
  function js_package() {
    // Add transcoded data.
    if (!empty($this->output_transcode)) {
      $data = new \stdClass();
      /* @var \wjs\transcode $transcode */
      foreach ($this->output_transcode as $type => $transcodes) {
        $data->$type             = new \stdClass();
        $class                   = new ReflectionClass($type);
        $data->$type->__PARENT__ = $class->getParentClass()->getName();
        foreach ($transcodes as $transcode_id => $transcode) {
          $data->$type->$transcode_id = $transcode->convert('array');
        }
      }
      $this->output['transcoded_data'] = $data;
    }
    return ($this->output) ? json_encode($this->output) : '{}';
  }

  /**
   * @return string
   * Return javascript containing loaded collections,
   * ready to parse on page loading.
   */
  function js_unpacker() {
    $output_json = array();
    // Add loaders types.
    $output_json[] = 'core_loaders:' . json_encode(array_keys($this->collections_loaders));
    // Load functions and class called in server side for this page.
    $js_package = $this->js_package();
    if ($js_package !== NULL) {
      $output_json[] = 'default_package:' . $js_package;
    }
    // Add object brackets.
    $output_json = (!empty($output_json)) ? '{' . implode(',', $output_json) . '}' : '';
    // Launch Javascript init function containing startup data.
    return 'window.w.init(' . $output_json . ');';
  }

  /**
   * List of required javascript files for wjs to works properly.
   * It includes loader's javascript from core and extra loaders
   * append from external applications.
   * @return array
   */
  function js_files() {
    // Add core file.
    $files = array();
    foreach ($this->js_core_files[$this->js_core_files_version] as $file) {
      $files[] = $this->path('client', 'wjs') . $file;
    }
    /* @var \wjs\loader $loader */
    foreach ($this->collections_loaders as $loader_name => $loader) {
      if ($this->js_core_files_version !== 'master' || !in_array($loader_name, $this->loaders_core)) {
        $js_file = $loader->js_file();
        if ($js_file !== FALSE && file_exists(dirname($loader->inc) . '/' . $js_file)) {
          // Compute the path of loader's js file,
          // regarding server side site's root,
          // and loader .inc folder path.
          $files[] = $this->path('client', 'root') . $this->path_subtract(dirname($loader->inc), $this->path('server', 'root')) . $js_file;
        }
      }
    }
    return $files;
  }

  function js_header_includes() {
    $output = '';
    foreach ($this->js_files() as $file) {
      $output .= '<script type="text/javascript" src="' . $file . '"></script>';
    }
    return $output;
  }

  function js_header() {
    $output = '';
    // Init should be at the end of page to let other scripts
    // adds some action into w.ready().
    // Wrap into scripts tags to insert into html page.
    $output .= '<script type="text/javascript">' . $this->js_unpacker() . '</script>';
    return $output;
  }
}