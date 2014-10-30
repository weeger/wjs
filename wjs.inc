<?php

const WJS_VERSION                    = '3.0.1';
const WJS_ERR_PUSH_MISSING_EXTENSION = 'WJS_ERR_PUSH_MISSING_EXTENSION';
const WJS_ERR_MISSING_LOADER         = 'WJS_ERR_MISSING_LOADER';

require_once 'class/router.inc';
require_once 'class/loader.inc';
require_once 'class/summary.inc';
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
  var $outputPackage;
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
      // and also wjsLoader loader.
      'wjs.min.js',
    ),
    'source' => array(
      // Files order is important.
      // In this case, wjsLoader loader
      // is added via the normal js list way.
      'js/wjs.js',
      'js/loader.js',
      'js/process.js',
      'loader/jsScript/jsScript.js',
      'loader/wjsLoader/wjsLoader.js',
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
  var $errorLevel = E_USER_ERROR;

  /**
   * Initialize wjs.
   */
  function __construct($routes = array()) {
    parent::__construct($routes);
    // Add default loaders.
    $this->summaryAdd(new \Wjs\WjsCoreSummary());
  }

  /**
   * Add new extension loader.
   */
  function loaderAdd($name, $path) {
    // Directory must have loader name.
    $path .= $name;
    // Directory must contain at least one PHP file :
    //   - [name].inc : Containing PHP class
    // The JS loader must exists, but file can be declared
    // from another source.
    //   - [name].js : Containing Js class
    if (!is_file($path . '.inc')) {
      trigger_error('wjs error : missing ' . $path . '.inc file for loader ' . $name, E_USER_ERROR);
    }
    else {
      // Load PHP class definition.
      require_once $path . '.inc';
      $class_name           = '\Wjs\Loader\\' . $name;
      $this->loaders[$name] = new $class_name(NULL, $name, $this);
    }
  }

  /**
   * @param      $name
   * @param bool $reload Used internally to avoid recursion.
   *
   * @return \Wjs\Loader
   */
  function loaderGet($name, $reload = FALSE) {
    if (isset($this->loaders[$name])) {
      return $this->loaders[$name];
    }
    elseif ($reload === FALSE && $this->extensionGet('wjsLoader', $name)) {
      // Add loader from registered extension.
      $this->loaderAdd($name, $this->extensionGet('wjsLoader', $name));
      // Loader must have been added.
      return $this->loaderGet($name, TRUE);
    }
    $this->error(WJS_ERR_MISSING_LOADER . ' : ' . $name);
    return NULL;
  }

  /**
   * Import data from a summary.
   *
   * @param \Wjs\Summary $summary
   */
  function summaryAdd(\Wjs\Summary $summary) {
    $this->summaries[get_class($summary)] = $summary;
    $this->summaryImportExtensionsLoaders($summary);
    $this->summaryImportExtensions($summary);
  }

  function summaryImportExtensionsLoaders(\Wjs\Summary $summary) {
    foreach ($summary->loaders as $loaderName => $loaderDirectory) {
      $this->loaderAdd($loaderName, $summary->pathPhpFile . $loaderDirectory);
    }
  }

  function summaryImportExtensions(\Wjs\Summary $summary) {
    foreach ($summary->extensions as $type => $items) {
      foreach ($items as $name => $path) {
        $this->extensionAdd($type, $name, $summary->pathPhpFile . $path);
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
    return ($this->outputPackage) ? json_encode($this->outputPackage) : '{}';
  }

  /**
   * Return json containing loaded extensions,
   * ready to parse on page loading.
   */
  function initPackage() {
    // Create a list of loaders who are added,
    // but no script file for them, so we need to
    // build it at startup.
    $loadersBasic = array();
    foreach ($this->loaders as $loader) {
      if ($loader->pathJsFile === FALSE) {
        $loadersBasic[] = $loader->name;
      }
    }
    // Add list of wjsLoaders available remotely,
    // it prevent wjs to fail when retrieving undefined loaders.
    $output_json = array();
    // Add loaders types.
    $output_json[] = '"settings":' . json_encode($this->settings);
    $output_json[] = '"loadersBasic":' . json_encode($loadersBasic);
    $output_json[] = '"loadersExtra":' . json_encode(array_keys($this->loaderGet('wjsLoader')->extensions));
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
   * @return string
   */
  function renderHeader() {
    $output = '';
    foreach ($this->jsFiles() as $file) {
      $output .= $this->renderJsInclude($file);
    }
    $output .= '<script type="text/javascript">' . $this->renderJsUnpacker() . '</script>';
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
    return 'window.wjs.init(' . $this->initPackage() . ');';
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