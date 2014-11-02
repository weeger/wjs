<?php

const WJS_VERSION                    = '3.1.0';
const WJS_ERR_PUSH_MISSING_EXTENSION = 'WJS_ERR_PUSH_MISSING_EXTENSION';
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
  var $jsCoreFilesVersion = 'master';
  /**
   * Settings are transmitted to JS.
   * @var array $settings
   */
  var $settings = array(
    'responsePath'              => '',
    'responseQueryExtraParam'   => '',
    'requestVariableName'       => 'wjs',
    'requestVariableKeyType'    => 't',
    'requestVariableKeyName'    => 'n',
    'requestVariableKeyExclude' => 'no',
  );
  /**
   * Keep a reference to added summaries.
   * @var array
   */
  var $summaries = array();
  var $cacheEnabled = FALSE;
  var $errorLevel = E_USER_ERROR;

  /**
   * Initialize wjs.
   */
  function __construct($routes = array()) {
    parent::__construct($routes);
    // Add core wjs loader manually.
    $this->loaders['WjsLoader'] = new \Wjs\Loader\WjsLoader(NULL, $this);
    // Load core summary,
    // paths defined must be relocated accordingly wjs.
    $summary = new \Wjs\WjsCoreSummary();
    foreach ($summary->extensions['WjsLoader'] as $loaderName => $args) {
      $summary->extensions['WjsLoader'][$loaderName] = array(
        $this->routeGet('server', 'wjs') . $summary->extensions['WjsLoader'][$loaderName][0],
        $this->routeGet('client', 'wjs') . $summary->extensions['WjsLoader'][$loaderName][1],
      );
    }
    // Add default loaders.
    $this->summaryAdd($summary);
  }

  /**
   * @param      $name
   *
   * @return \Wjs\Loader
   */
  function loaderGet($name) {
    return $this->loaders[$name];
  }

  function cacheEnable() {
    $pathCache = $this->routeGet('server', 'cache');
    if ($pathCache) {
      if (file_exists($pathCache) && is_writable($pathCache)) {
        $this->cacheEnabled = TRUE;
      }
      else {
        $this->error('Path cache not found or not writable : ' . $pathCache);
      }
    }
    else {
      $this->error('Missing cache path');
    }
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
  function extensionAdd($extensionType, $extensionName, $extensionData) {
    $this
      ->loaderGet($extensionType)
      ->extensionAdd($extensionName, $extensionData);
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
    $loader = $this->loaderGet($extensionType);
    if ($loader) {
      if (isset($loader->extensions[$extensionName])) {
        $extensionData = $loader->extensionPush($extensionName, $loader->extensions[$extensionName], $excludeRequire);
      }
      else {
        $extensionData = WJS_ERR_PUSH_MISSING_EXTENSION;
      }
      $this->outputPackage[$extensionType][$extensionName] = $this->packageBuildEntry($extensionType, $extensionName, $extensionData);
    }
  }

  function extensionPushArray($array) {
    foreach ($array as $extensionType => $items) {
      foreach ($items as $extensionName) {
        $this->extensionPush($extensionType, $extensionName);
      }
    }
  }

  function extensionPushRequest($requestArray) {
    foreach ($requestArray as $item) {
      $excludeRequire = isset($item[$this->settings['requestVariableKeyExclude']]) ? $item[$this->settings['requestVariableKeyExclude']] : FALSE;
      // Must be boolean or array,
      // param for true is "1".
      if ($excludeRequire) {
        if (is_array($excludeRequire)) {
          foreach ($excludeRequire as $type => $items) {
            $excludeRequire[$type] = explode(',', $items);
          }
        }
        else {
          $excludeRequire = TRUE;
        }
      }
      $this->extensionPush(
        $item[$this->settings['requestVariableKeyType']],
        $item[$this->settings['requestVariableKeyName']],
        $excludeRequire
      );
    }
  }

  /**
   * Shorthand function name for extensionPush.
   * If a value specified, add extensions before pushing it.
   */
  function push($extensionType, $extensionName, $value = NULL) {
    if ($value) {
      $this->extensionAdd($extensionType, $extensionName, $value);
    }
    $this->extensionPush($extensionType, $extensionName);
  }

  /**
   * Create entry for extension data according to the transfer method type.
   */
  function packageBuildEntry($extensionType, $extensionName, $extensionData) {
    // Here will be managed cached content.
    return $extensionData;
  }

  function response() {
    header('Content-Type: application/json');
    print $this->responsePackage();
    exit;
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
        $loadersBasic[] = $loader->name;
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
   * Return all needed scripts for HTML head to init wjs.
   *
   * @param int $indentLength Allow links to be indented.
   *
   * @return string
   */
  function renderHeader($indentLength = 0) {
    $output = '';
    $indent = $indentLength === 0 ? '' : "\n" . str_repeat(' ', $indentLength);
    foreach ($this->jsFiles() as $file) {
      $output .= $indent . $this->renderJsInclude($file);
    }
    $output .= $indent . '<script type="text/javascript">' . $this->renderJsUnpacker() . '</script>';
    return $output;
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