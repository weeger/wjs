<?php

const WJS_VERSION                    = '3.3.0';
const WJS_ERR_PUSH_MISSING_EXTENSION = 'WJS_ERR_PUSH_MISSING_EXTENSION';
const WJS_ERR_PUSH_WRONG_DATA_TYPE   = 'WJS_ERR_PUSH_WRONG_DATA_TYPE';
const WJS_ERR_MISSING_LOADER         = 'WJS_ERR_MISSING_LOADER';

require_once 'class/router.inc';
require_once 'class/loader.inc';
require_once 'class/summary.inc';
require_once 'loader/JsLink/JsLink.inc';
require_once 'loader/WjsLoader/WjsLoader.inc';
require_once 'summary/core.wjs.inc';

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
    'packed' => array(
      'wjs.packed.js',
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
      'loader/JsLink/JsLink.js',
      'loader/WjsLoader/WjsLoader.js',
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
    'avoidEval'    => FALSE
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
  var $errorLevel = E_USER_ERROR;

  /**
   * Initialize wjs.
   */
  function __construct($routes = array(), $jsCoreFilesVersion = 'master') {
    parent::__construct($routes);
    $this->jsCoreFilesVersion = $jsCoreFilesVersion;
    // Add core summary.
    $this->summaryCoreLoad();
  }

  /**
   * Load core summary and relocate files,
   * according the wjs root path.
   */
  function summaryCoreLoad() {
    // Load core summary,
    $summary = new \Wjs\WjsCoreSummary();
    // paths defined must be relocated accordingly to wjs.
    foreach ($summary->extensions['WjsLoader'] as $loaderName => $routesList) {
      foreach ($routesList as $side => $routes) {
        foreach ($routes as $name => $route) {
          // Non-source versions uses loader.min.js instead loader.js.
          if ($this->jsCoreFilesVersion === 'source' && $name === 'js') {
            // Remove .min.js
            $summary->extensions['WjsLoader'][$loaderName][$side][$name] = str_replace('.min.js', '.js', $summary->extensions['WjsLoader'][$loaderName][$side][$name]);
          }
          $summary->extensions['WjsLoader'][$loaderName][$side][$name] = $this->routeGet($side, 'wjs') . $summary->extensions['WjsLoader'][$loaderName][$side][$name];
        }
      }
    }
    if ($this->jsCoreFilesVersion === 'source') {
      foreach ($summary->extensions['JsMethod'] as $methodName => $path) {
        $summary->extensions['JsMethod'][$methodName] = str_replace('.min.js', '.js', $summary->extensions['JsMethod'][$methodName]);
      }
    }
    $this->summaryCoreRelocate($summary, 'JsMethod');
    // Add core wjs loaders manually,
    // This order has an impact on the order
    // of rendering header links (based on loaders var).
    $this->loaders['WjsLoader']                          = new \Wjs\Loader\WjsLoader($summary->extensions['WjsLoader']['WjsLoader'], $this);
    $this->loaders['WjsLoader']->extensions['WjsLoader'] = $summary->extensions['WjsLoader']['WjsLoader'];
    unset($summary->extensions['WjsLoader']['WjsLoader']);
    // Add default loaders.
    $this->summaryAdd($summary);
  }

  function summaryCoreRelocate($summary, $name) {
    foreach ($summary->extensions[$name] as $extensionName => $extensionValue) {
      $summary->extensions[$name][$extensionName] = $this->routeGet('server', 'wjs') . $extensionValue;
    }
  }

  function define($type, $loaderData) {
    $this->extensionAdd('WjsLoader', $type, $loaderData);
  }

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

  function response($get = NULL) {
    if ($get !== NULL) {
      $this->extensionPushRequest($get);
    }
    header('Content-Type: application/json');
    print $this->responsePackage();
    exit;
  }

  function cacheEnable() {
    $pathCacheFile = $this->routeGet('server', 'cacheFile');
    if ($pathCacheFile) {
      // Check that directory exists for file.
      $pathCacheDir = substr($pathCacheFile, 0, -strlen(strrchr($pathCacheFile, '/')));
      if (file_exists($pathCacheDir) && is_writable($pathCacheDir)) {
        $this->cacheEnabled = TRUE;
      }
      else {
        $this->error('Path cache not found or not writable : ' . $pathCacheFile);
      }
    }
    else {
      $this->error('Missing cache path');
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
    return $this->loaders[$name];
  }

  /**
   * Import data from a summary.
   *
   * @param \Wjs\Summary $summary
   */
  function summaryAdd(\Wjs\Summary $summary) {
    $this->summaries[get_class($summary)] = $summary;
    $this->summaryImportExtensions($summary);
  }

  function summaryImportExtensions(\Wjs\Summary $summary) {
    foreach ($summary->extensions as $type => $items) {
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

  function extensionAddRequireArray($extensionType, $extensionName, $requirements) {
    // Add requirements.
    foreach ($requirements as $requireType => $requireNames) {
      foreach ($requireNames as $requireName) {
        $this->extensionAddRequire($extensionType, $extensionName, $requireType, $requireName);
      }
    }
  }

  function extensionAddRequire($extensionType, $extensionName, $requireType, $requireName) {
    $this
      ->loaderGet($extensionType)
      ->extensionAddRequire($extensionName, $requireType, $requireName);
  }

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
      $extensionData                            = $loader->extensionPush($extensionName, $excludeRequire);
      $loader->extensionsPushed[$extensionName] =
      $this->outputPackage[$extensionType][$extensionName] = $this->packageBuildEntry($extensionType, $extensionName, $extensionData);
    }
  }

  function extensionPushRemove($extensionType, $extensionName) {
    if (isset($this->outputPackage[$extensionType]) && isset($this->outputPackage[$extensionType][$extensionName])) {
      unset($this->outputPackage[$extensionType][$extensionName]);
      unset($this->loaderGet($extensionType)->extensionsPushed[$extensionName]);
      if (empty($this->outputPackage[$extensionType])) {
        unset($this->outputPackage[$extensionType]);
      }
    }
  }

  function extensionPushArray($array, $exclude) {
    foreach ($array as $extensionType => $items) {
      foreach ($items as $extensionName) {
        $this->extensionPush($extensionType, $extensionName, $exclude);
      }
    }
  }

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

  function queryExplode($query) {
    foreach ($query as $type => $items) {
      $query[$type] = explode(',', $items);
    }
    return $query;
  }

  /**
   * Create entry for extension data according to the transfer method type.
   */
  function packageBuildEntry($extensionType, $extensionName, $extensionData) {
    // Here will be managed cached content.
    return $extensionData;
  }

  function responseClear() {
    $this->outputPackage = array();
  }

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
    $output_json = array();
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
   * @return array
   */
  function jsFiles() {
    $basePath = $this->routeGet('client', 'wjs');
    // Add core file.
    $files = array();
    foreach ($this->jsCoreFiles[$this->jsCoreFilesVersion] as $file) {
      $files[] = $basePath . $file;
    }
    return $files;
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

  function renderJsCache() {
    $files        = $this->jsFiles();
    $cacheContent = '';
    foreach ($files as $file) {
      $cacheContent .= file_get_contents($file);
    }
    return $cacheContent . $this->renderJsUnpacker();
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
      $cachePath = $this->routeGet('server', 'cacheFile');
      file_put_contents($cachePath, $this->renderJsCache());
      $output = $this->renderJsInclude($cachePath);
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
   * Trigger wjs error.
   *
   * @param $message
   */
  function error($message) {
    trigger_error('wjs error : ' . $message, $this->errorLevel);
  }
}