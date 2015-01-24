<?php

define('WJS_VERSION', '3.3.9');
define('WJS_PATH_ROOT', str_replace('\\', '/', dirname(__FILE__)) . '/');
define('WJS_ERR_PUSH_UNDEFINED_EXTENSION', 'WJS_ERR_PUSH_UNDEFINED_EXTENSION');
define('WJS_ERR_PUSH_UNDEFINED_DATA_TYPE', 'WJS_ERR_PUSH_UNDEFINED_DATA_TYPE');

require_once WJS_PATH_ROOT . 'class/router.inc';
require_once WJS_PATH_ROOT . 'class/loader.inc';
require_once WJS_PATH_ROOT . 'class/summary.inc';
require_once WJS_PATH_ROOT . 'extension/WjsLoader/JsLink/JsLink.inc';
require_once WJS_PATH_ROOT . 'extension/WjsLoader/WjsLoader/WjsLoader.inc';
require_once WJS_PATH_ROOT . 'summary/core.wjs.inc';

use \Wjs\Router;

class Wjs extends Router {
  /**
   * Wjs seek for codes into server side,
   * it needs also links to some client paths
   * to retrieves data when running.
   */
  var $routeRequired = array(
    'server' => array(
      'wjs', // wjs server folder.
    )
  );
  /**
   * Contain loaders objects.
   * @var array
   */
  var $loaders = array();
  /**
   * Contain data to transmit to wjs javascript object.
   */
  var $outputPackage = array();
  /**
   * Contain list of core files, used to complete list
   * of output js files list. Core files can differ from
   * wjs versions, public version have core file aggregated
   * into one file at the library root.
   * @var array
   */
  var $jsCoreFiles = array(
    'master' => array(
      // Minified version contain core js,
      // and also WjsLoader loader.
      'wjs.min.js',
    ),
    'jQuery' => array(
      'wjs.jquery.js',
    ),
    'source' => array(
      // Files order is important.
      // In this case, WjsLoader loader
      // is added via the normal js list way.
      'src/wjs.js',
      'src/loader.js',
      'src/process.js',
      'extension/WjsLoader/JsLink/JsLink.js',
      'extension/WjsLoader/WjsLoader/WjsLoader.js',
    ),
  );
  /**
   * Define which js files to use.
   * @var string
   */
  var $jsCoreFilesVersion;
  /**
   * Settings are transmitted to JS.
   * @var array $settings
   */
  var $settings = array(
    'responsePath' => '',
    'paramExtra'   => '',
    'paramInc'     => 'wjs',
    'paramExc'     => 'wjs-exc',
    'paramToken'   => 'wjs-tok',
    'cacheDir'     => FALSE
  );
  /**
   * Keep a reference to added summaries.
   * @var array
   */
  var $summaries = array();
  /**
   * Specify to use cached content,
   * cache directory must be known.
   * @var bool $cacheEnabled
   */
  var $cacheEnabled = FALSE;
  var $cacheFlush = FALSE;
  var $errorLevel = E_USER_ERROR;

  /**
   * Initialize wjs.
   */
  function __construct($routes = array()) {
    // If no arguments, try to detect path
    // from current working directory.
    if (func_num_args() === 0) {
      $routes = $this->pathCleanupSlashes($this->pathSubtract(getcwd() . '/', dirname(__FILE__))) . '/';
    }
    // If routes variable is a string,
    // we assume that it is the route from
    // server and client locations.
    if (is_string($routes)) {
      $routes = array(
        'server' => array(
          'wjs' => $routes
        ),
        'client' => array(
          'wjs' => $routes
        )
      );
    }
    // If token sent in URL, use it as cacheToken.
    if (isset($_GET[$this->settings['paramToken']])) {
      $routes['server']['cacheToken'] = $_GET[$this->settings['paramToken']];
    }
    parent::__construct($routes);
    // Define core version.
    $this->jsCoreFilesVersion = isset($routes['server']['jsCoreFilesVersion']) ? $routes['server']['jsCoreFilesVersion'] : 'master';
    // Add core summary.
    $this->summaryAdd(new \Wjs\WjsCoreSummary());
    // Enable caching if folder is set.
    $cacheDir = $this->routeGet('server', 'cacheDir');
    if ($cacheDir) {
      // Check that directory exists for file.
      $cacheDir = substr($cacheDir, 0, -strlen(strrchr($cacheDir, '/')));
      if (!file_exists($cacheDir) || !is_dir($cacheDir) || !is_writable($cacheDir)) {
        // Empty variable.
        $this->routeAdd('server', 'cacheDir', FALSE);
        // Trigger error.
        $this->error('Path cache not found or not writable : ' . $cacheDir);
      }
      else {
        $this->cacheEnabled         = TRUE;
        $this->settings['cacheDir'] = $this->routeGet('client', 'cacheDir');
        $this->extensionPush('WjsLoader', 'CacheLink');
      }
    }
  }

  /**
   * Add new extension type, extension loader must exists.
   *
   * @param $type
   * @param $loaderData
   */
  function define($type, $loaderData) {
    $this->extensionAdd('WjsLoader', $type, $loaderData);
  }

  /**
   * Register a new extension available for preload or remote load.
   *
   * @param       $type
   * @param       $name
   * @param       $arguments
   * @param array $requirements
   */
  function register($type, $name, $arguments, $requirements = array()) {
    $this->extensionAdd($type, $name, $arguments, $requirements);
  }

  /**
   * Shorthand function name for extensionPush.
   * If a value specified, add extensions before pushing it.
   */
  function import($extensionType, $extensionName, $value = NULL) {
    if ($value) {
      $this->extensionAdd($extensionType, $extensionName, $value);
    }
    $this->extensionPush($extensionType, $extensionName);
  }

  /**
   * Transform $_GET style array to wjs response package.
   *
   * @param null $get
   */
  function response($get = NULL) {
    if ($get !== NULL) {
      $this->extensionPushRequest($get);
    }
    header('Content-Type: application/json');
    print $this->responsePackage();
    exit;
  }

  /**
   * Run response only if ajax query is detected.
   */
  function ajax() {
    if (isset($_GET) && isset($_GET[$this->settings['paramInc']])) {
      $this->response($_GET);
    }
  }

  /**
   * Return an existing extension loader.
   *
   * @param      $name
   *
   * @return \Wjs\Loader
   */
  function loaderGet($name) {
    return isset($this->loaders[$name]) ? $this->loaders[$name] : FALSE;
  }

  /**
   * Import data from a summary.
   *
   * @param \Wjs\Summary $summary
   */
  function summaryAdd(\Wjs\Summary $summary) {
    $this->summaries[get_class($summary)] = $summary;
    $summary->add($this);
    $this->summaryImportExtensions($summary);
  }

  /**
   * Parse given summary object, and import defined content.
   *
   * @param \Wjs\Summary $summary
   */
  function summaryImportExtensions(\Wjs\Summary $summary) {
    $extensions = array_merge($summary->extensions, $summary->getExtensions($this));
    foreach ($extensions as $type => $items) {
      foreach ($items as $name => $data) {
        $this->extensionAdd($type, $name, $data);
      }
    }
  }

  /**
   * Register extension file / folder into available list of extensions.
   * This will not push extension to output package.
   */
  function extensionAdd($extensionType, $extensionName, $extensionData, $requirements = array()) {
    $this
      ->loaderGet($extensionType)
      ->extensionAdd($extensionName, $extensionData);
    $this->extensionAddRequireArray($extensionType, $extensionName, $requirements);
  }

  /**
   * Add multiple requirements for given extension type and name.
   *
   * @param $extensionType
   * @param $extensionName
   * @param $requirements
   */
  function extensionAddRequireArray($extensionType, $extensionName, $requirements) {
    // Add requirements.
    foreach ($requirements as $requireType => $requireNames) {
      foreach ($requireNames as $requireName) {
        $this->extensionAddRequire($extensionType, $extensionName, $requireType, $requireName);
      }
    }
  }

  /**
   * Add one extension type.
   *
   * @param $extensionType
   * @param $extensionName
   * @param $requireType
   * @param $requireName
   */
  function extensionAddRequire($extensionType, $extensionName, $requireType, $requireName) {
    $this
      ->loaderGet($extensionType)
      ->extensionAddRequire($extensionName, $requireType, $requireName);
  }

  /**
   * Return saved extension.
   *
   * @param $extensionType
   * @param $extensionName
   *
   * @return mixed
   */
  function extensionGet($extensionType, $extensionName) {
    return $this->loaderGet($extensionType)->extensions[$extensionName];
  }

  /**
   * Add previously registered function to the output package.
   *
   * @param            $extensionType
   * @param            $extensionName
   * @param bool|array $excludeRequire
   */
  function extensionPush($extensionType, $extensionName, $excludeRequire = FALSE) {
    // Do not push core loaders.
    if ($extensionType === 'WjsLoader' && ($extensionName === 'WjsLoader' || $extensionName === 'JsLink')) {
      return;
    }
    $loader = $this->loaderGet($extensionType);
    if ($loader) {
      $useJsCache = $this->cacheEnabled && $loader->allowJsCache;
      if ($useJsCache) {
        // Get path for this specific type.
        $pathCache = $this->cacheExtensionPath($extensionType, $extensionName);
        // Get path for file on the server.
        $pathCacheServer = $this->routeGet('server', 'cacheDir') . $pathCache;
        // Add new dependency.
        $this->register('CacheLink', $pathCache, $this->routeGet('client', 'cacheDir') . $pathCache);
        // Add JsLink requirement.
        $this->extensionAddRequire($extensionType, $extensionName, 'CacheLink', $pathCache);
        // Build output package.
        $extensionData = $loader->extensionPush($extensionName, $excludeRequire);
        // Avoid missing extensions errors.
        if ($extensionData !== WJS_ERR_PUSH_UNDEFINED_EXTENSION) {
          // Recreate cache file.
          if ($this->cacheFlush === TRUE || !is_file($pathCacheServer)) {
            // Create directory.
            $this->cacheExtensionPathCreate($extensionType);
            // Create file.
            file_put_contents($pathCacheServer,
              '(function(c){"use strict";c.wjs.cacheHandle("' . $extensionType . '","' . $extensionName . '",' . $loader->cacheJsEncode($extensionData['#data']) . ');}(wjsContext));');
          }
          // Replace data by logical cache path.
          $extensionData['#data'] = 'cache://' . $pathCache;
        }
      }
      else {
        // Build output package.
        $extensionData = $loader->extensionPush($extensionName, $excludeRequire);
      }
    }
    else {
      $extensionData = WJS_ERR_PUSH_UNDEFINED_DATA_TYPE;
    }
    $loader->extensionsPushed[$extensionName] =
    $this->outputPackage[$extensionType][$extensionName] = $extensionData;
  }

  /**
   * Push multiple extensions.
   *
   * @param $array
   * @param $exclude
   */
  function extensionPushArray($array, $exclude) {
    foreach ($array as $extensionType => $items) {
      foreach ($items as $extensionName) {
        $this->extensionPush($extensionType, $extensionName, $exclude);
      }
    }
  }

  /**
   * Push extensions from the given list.
   *
   * @param $requestArray
   */
  function extensionPushRequest($requestArray) {
    $requests = $this->queryExplode($requestArray[$this->settings['paramInc']]);
    // Exclude must be boolean or array,
    // param for true is "1".
    if (isset($requestArray[$this->settings['paramExc']])) {
      $exclude = $requestArray[$this->settings['paramExc']];
      if (is_array($exclude)) {
        $exclude = $this->queryExplode($exclude);
      }
      else {
        $exclude = TRUE;
      }
    }
    else {
      $exclude = array();
    }
    // Iterate over types.
    foreach ($requests as $type => $items) {
      // Iterate over items.
      foreach ($items as $name) {
        // Get normal exclusions.
        $excludeItem = $exclude;
        $this->extensionPush($type, $name, $excludeItem);
      }
    }
  }

  /**
   * Explode extensions names sent by query string.
   *
   * @param $query
   *
   * @return mixed
   */
  function queryExplode($query) {
    foreach ($query as $type => $items) {
      $query[$type] = explode(',', $items);
    }
    return $query;
  }

  /**
   * Return path for specified extension.
   */
  function cacheExtensionPath($extensionType, $extensionName) {
    $pieces = $this->cacheExtensionInfo($extensionType, $extensionName);
    return implode($pieces) . $extensionName . $this->routeGet('server', 'cacheToken') . '.js';
  }

  /**
   * Return pieces of cache extension path.
   *
   * @param      $extensionType
   *
   * @return array
   */
  function cacheExtensionInfo($extensionType) {
    return array(
      'type' => $extensionType . '/',
    );
  }

  /**
   * Create directory for extension cache file.
   *
   * @param $extensionType
   */
  function cacheExtensionPathCreate($extensionType) {
    $pieces = $this->cacheExtensionInfo($extensionType);
    $base   = $this->routeGet('server', 'cacheDir');
    while (!empty($pieces)) {
      $base .= array_shift($pieces);
      if (!is_dir($base)) {
        mkdir($base);
      }
    }
  }

  /**
   * Empty output package.
   */
  function responseClear() {
    $this->outputPackage = array();
  }

  /**
   * Return json encoded response.
   * @return string
   */
  function responsePackage() {
    return (!empty($this->outputPackage)) ? json_encode($this->outputPackage) : '{}';
  }

  /**
   * Return json containing loaded extensions,
   * ready to parse on page loading.
   */
  function initPackage() {
    // Append loaders for pushed extensions,
    // it allow to parse start package completely.
    foreach ($this->outputPackage as $type => $items) {
      $this->extensionPush('WjsLoader', $type);
    }
    // Use path from route.
    $this->settings['responsePath'] = $this->routeGet('client', 'responsePath');
    // Send cache token, it will be added
    // to ajax calls, in order to avoid to regenerate
    // a new token for the same session.
    $this->settings['cacheToken'] = $this->routeGet('server', 'cacheToken');
    $output_json                  = array();
    // Add settings.
    $output_json[] = '"settings":' . json_encode($this->settings);
    // Create a list of loaders who are added,
    // but no script file for them, so we need to
    // build them at startup.
    $loadersBasic = array();
    foreach ($this->loaders as $loader) {
      if ($loader->pathJsFile === FALSE) {
        $loadersBasic[] = $loader->type;
      }
    }
    $output_json[] = '"loadersBasic":' . json_encode($loadersBasic);
    // Add list of WjsLoader available remotely,
    // it prevent wjs to fail when retrieving undefined loaders.
    $output_json[] = '"loadersExtra":' . json_encode(array_keys($this->loaderGet('WjsLoader')->extensions));
    // Load functions and class called in server side for this page.
    $js_package = $this->responsePackage();
    if ($js_package !== NULL) {
      $output_json[] = '"packageDefault":' . $js_package;
    }
    // Add object brackets.
    return (!empty($output_json)) ? '{' . implode(',', $output_json) . '}' : '';
  }

  /**
   * List of required javascript files for wjs to works properly.
   * It includes loader's javascript from core and extra loaders
   * append from external applications.
   * Ensure to fill client > wjs route to define location of wjs
   * core files when using this list.
   *
   * @param string $side
   *
   * @return array
   */
  function jsFiles($side = 'client') {
    $basePath = $this->routeGet($side, 'wjs');
    // Add core file.
    $files = array();
    foreach ($this->jsCoreFiles[$this->jsCoreFilesVersion] as $file) {
      $files[] = $basePath . $file;
    }
    return $files;
  }

  /**
   * Convert a path.js to path.min.js.
   * @param $path
   *
   * @return string
   */
  function jsPathMin($path) {
    return substr($path, 0, -strlen('.js')) . '.min.js';
  }

  /**
   * Get list of @require declarations into the given source.
   *
   * @param $extensionType
   * @param $extensionName
   * @param $jsContent
   */
  function jsParseRequire($extensionType, $extensionName, $jsContent) {
    // Get list of @require function.
    // Search for all "@require type > name" into script and add it to the output array.
    preg_match_all("`@require\\s(.*)\\s>\\s(.*)\\s`", $jsContent, $results);
    foreach ($results[0] as $key => $item) {
      $this->extensionAddRequire($extensionType, $extensionName, trim($results[1][$key]), trim($results[2][$key]));
    }
  }

  /**
   * Create cached javascript file.
   * @return string
   */
  function renderJsCache() {
    $files        = $this->jsFiles('server');
    $cacheContent = '';
    foreach ($files as $file) {
      $cacheContent .= file_get_contents($file);
    }
    return trim($cacheContent) . $this->renderJsUnpacker();
  }

  /**
   * Return all needed scripts for HTML head to init wjs.
   *
   * @param int $indentLength Allow links to be indented.
   *
   * @return string
   */
  function renderHeader($indentLength = 0) {
    $output = '';
    $indent = $indentLength === 0 ? '' : "\n" . str_repeat(' ', $indentLength);
    // In case of cache we aggregate files in one.
    if ($this->cacheEnabled) {
      $cacheStartupFileName = 'startup' . $this->routeGet('server', 'cacheToken') . '.js';
      // Get paths from server side.
      $cacheFileStartupServer = $this->routeGet('server', 'cacheFileStartup');
      $cacheFileStartupServer = ($cacheFileStartupServer) ? $cacheFileStartupServer : $this->routeGet('server', 'cacheDir') . $cacheStartupFileName;
      // Get paths from client side.
      $cacheFileStartupClient = $this->routeGet('client', 'cacheFileStartup');
      $cacheFileStartupClient = ($cacheFileStartupClient) ? $cacheFileStartupClient : $this->routeGet('client', 'cacheDir') . $cacheStartupFileName;
      // Create file on server.
      file_put_contents($cacheFileStartupServer, $this->renderJsCache());
      // Add link from client.
      $output = $this->renderJsInclude($cacheFileStartupClient);
    }
    else {
      $files = $this->jsFiles();
      foreach ($files as $file) {
        $output .= $indent . $this->renderJsInclude($file);
      }
      $output .= $indent . '<script type="text/javascript">' . $this->renderJsUnpacker() . '</script>';
    }
    return trim($output);
  }

  /**
   * Render standard javascript file include.
   *
   * @param string $path
   *
   * @return string
   */
  function renderJsInclude($path) {
    return '<script type="text/javascript" src="' . $path . '"></script>';
  }

  /**
   * Render javascript used to start wjs.
   * @return string
   */
  function renderJsUnpacker() {
    return ($this->jsCoreFilesVersion === 'jQuery' ? 'jQuery' : 'window') . '.wjs.init(' . $this->initPackage() . ');';
  }

  /**
   * Return a client path from a server location
   * compared by the actual wjs server and client paths.
   *
   * @param $pathServer
   *
   * @return string
   */
  function pathClientRelative($pathServer) {
    // Get path from summary to wjs.
    $pathClientRelative = $this->pathRelative(realpath($this->routeGet('server', 'wjs')), realpath($pathServer));
    // Adjust path from wjs client path.
    return $this->pathNormalize($this->routeGet('client', 'wjs') . $pathClientRelative) .
    (is_dir($pathServer) ? '/' : '');
  }

  function scanFolderExtensions($directory, $globalData = array(), $order = array()) {
    $directory = $this->pathNormalize($directory) . '/';
    $scan      = $this->scanOrdered($directory, array_keys($order));
    foreach ($scan as $item) {
      if ($this->loaderGet($item)) {
        // Get item specific params.
        $itemGlobalData = isset($globalData[$item]) ? $globalData[$item] : array();
        $itemOrder      = isset($order[$item]) ? $order[$item] : array();
        $this->loaderGet($item)->scanFolder($directory . $item . '/', $itemGlobalData, $itemOrder);
      }
    }
  }

  function scanOrdered($directory, $order) {
    $scan = scandir($directory);
    return array_merge($order, array_diff($scan, $order));
  }

  /**
   * Trigger wjs error.
   *
   * @param $message
   */
  function error($message) {
    trigger_error('wjs error : ' . $message, $this->errorLevel);
  }
}