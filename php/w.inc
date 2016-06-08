<?php

namespace Wjs5;

define('WJS5_VERSION', '[$version]');
define('WJS5_PUSH_HIDDEN_EXTENSION', 'WJS5_PUSH_HIDDEN_EXTENSION');
define('WJS5_ERR_PUSH_UNDEFINED_EXTENSION_NAME', 'WJS5_ERR_PUSH_UNDEFINED_EXTENSION_NAME');
define('WJS5_ERR_PUSH_UNDEFINED_EXTENSION_TYPE', 'WJS5_ERR_PUSH_UNDEFINED_EXTENSION_TYPE');

if (!defined('WJS5_ROOT')) {
  // Wjs root contains path to this file like and
  // can be defined externally in order to keep
  // unresolved symlinks to w, when used.
  // It has better results on client relative
  // paths detection. This behavior is due to PHP
  // limitation who always resolve symlinks and
  // do not let a method to find unresolved paths.
  define('WJS5_ROOT', dirname(dirname(__FILE__)) . '/');
}

require_once WJS5_ROOT . 'php/atom.inc';
require_once WJS5_ROOT . 'php/extension.inc';
require_once WJS5_ROOT . 'extension/WjsLoader/WjsLoader/WjsLoader.class.inc';
require_once WJS5_ROOT . 'extension/WjsLoader/JsLink/JsLink.inc';
require_once WJS5_ROOT . 'extension/WjsLoader/WjsLoader/WjsLoader.inc';

class Wjs extends Atom {
  /**
   * Options can be defined by user.
   * @var array
   */
  var $default = array(
    'serverPathCache'     => FALSE,
    // Cache directory.
    'clientPathCache'     => '',
    // Allow to force clear all caches.
    'cacheFlush'          => FALSE,
    // Cache directory.
    'staticFilesEnabled'  => FALSE,
    // Name of aggregated w file.
    'staticFilesFlush'    => FALSE,
    // Allow to override existing files.
    'autoResponse'        => FALSE,
    // When true, execute ajax() method on Wjs instance.
    // These options will be transmitted to JS,
    // that's why some parameters are shorts.
    'aggregationFileName' => FALSE,
    // Name of aggregated w file.
    'clientName'          => 'w',
    // Wjs javascript object name like window.w.
    'paramExtra'          => '',
    // Parameters appended to AJAX requests.
    'paramInc'            => 'w',
    // Name of AJAX parameter.
    'paramExc'            => 'w-exc',
    // Name of AJAX parameter (exclusions).
    'paramToken'          => 'w-tok',
    // Name of URL extra token (AJAX and cache flush).
  );
  var $id;
  /**
   * Contain loaders objects.
   * @var Loader[]
   */
  var $loaders = array();
  /**
   * Contain data to transmit to w javascript object.
   */
  var $outputPackage = array();
  /**
   * Contain extension to transmit to w javascript object.
   * @var Extension[]
   */
  var $extensionsPushed = array();
  /**
   * Contain list of core files, used to complete list
   * of output js files list. Core files can differ from
   * w versions, public version have core file aggregated
   * into one file at the library root.
   * @var array
   */
  var $jsCoreFiles = array(
    'master' => array(
      // Minified version contain core js,
      // and also WjsLoader loader.
      'w.min.js',
    ),
    'jQuery' => array(
      'w.jquery.js',
    ),
    'source' => array(
      // Files order is important.
      // In this case, WjsLoader loader
      // is added via the normal js list way.
      'src/w.js',
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
  var $subversion;
  /**
   * Contain list of excluded extension
   * from output package.
   * @var array
   */
  var $extensionExclude = array();
  /**
   * Allow to send user extra settings
   * to client side w instance.
   * @var array
   */
  var $settings = array();
  var $cacheToken = FALSE;

  static $wjsInstancesCounter = 0;

  /**
   * Initialize w.
   * Can take multiple options types, if no option, try
   * to detect current w location path, if a string is
   * given, consider it as location path, otherwise
   * user argument is an options collection.
   */
  function __construct($options = array()) {
    parent::__construct($options);
    // Define core version.
    $this->subversion = isset($options['subversion']) ? $options['subversion'] : 'master';

    // Use an internal id to identify instances.
    $this->id = self::$wjsInstancesCounter++;

    // Save real working directory, it can be another
    // directory that website root when website is included.
    // Ex: /var/www/my_website/
    if ($this->optionGet('serverWorkingDirectory') === NULL) {
      $this->optionSet('serverWorkingDirectory', getcwd() . '/');
    }

    // Find the part of URL after domain and before query strings.
    // Site sub folder is also included if present.
    // Ex for domain.com/path/to/root/internal/folder/page.php :
    // - path/to/root/internal/folder/page.php
    if ($this->optionGet('clientPathFull') === NULL) {
      $this->optionSet('clientPathFull',
        // Do not save the left '/'
        ltrim(
        // Remove request URI.
          current(explode('?', $_SERVER['REQUEST_URI']))
          , '/'));
    }

    // Find path of website inside domain,
    // Ex for domain.com/path/to/root/internal/folder/page.php :
    // - path/to/root/
    if ($this->optionGet('clientPathWebsite') === NULL) {
      $folder = implode('/', array_intersect(
        explode('/', $this->optionGet('clientPathFull')),
        explode('/', dirname($_SERVER['SCRIPT_NAME']))
      ));
      // Add a trailing slash if not empty.
      if ($folder) {
        $folder = $this->pathAddSlash($folder);
      }
      // Find base path by intersecting requested URI and script path.
      $this->optionSet('clientPathWebsite', $folder);
    }

    // Find part of URI who represent internal site request
    // Ex for domain.com/path/to/root/internal/folder/page.php :
    // - internal/folder/page.php
    if ($this->optionGet('clientRequest') === NULL) {
      $this->optionSet('clientRequest', $this->pathRelative(
        $this->optionGet('clientPathWebsite'),
        $this->optionGet('clientPathFull')));
    }

    // Find the containing folder of current page.
    // Ex for domain.com/path/to/root/internal/folder/page.php :
    // - internal/folder/
    if ($this->optionGet('clientRequestDirectory') === NULL) {
      // Find base path.
      $parts = explode('/', $this->optionGet('clientRequest'));
      // Base path is path previous folder
      array_pop($parts);
      // Remove slash in case on empty directory.
      $clientRequestDirectory = implode('/', $parts);
      // Save.
      $this->optionSet('clientRequestDirectory', ($clientRequestDirectory !== '') ? $clientRequestDirectory . '/' : '');
    }

    // Relocate response path to client site root.
    $this->optionSet('clientPathResponse', $this->clientPathRebase($this->optionGet('clientPathResponse')));

    // Define relative path of w folder,
    // with cwd and unresolved root path.
    $this->optionSet('serverPathWjs', $this->pathRelative(
    // Use cwd as base path.
      $this->optionGet('serverWorkingDirectory'),
      // Subtract link.
      WJS5_ROOT));

    // Fill w client path if still missing.
    // Defining it manually can be useful
    // when URL rewriting is used.
    if (!$this->optionGet('clientPathWjs')) {
      $this->optionSet('clientPathWjs', $this->clientPath(WJS5_ROOT));
    }

    if ($this->optionGet('cacheFlush')) {
      $this->cacheToken = rand(0, 1000000);
    }

    // Create loader of loaders manually.
    // Add it by the classic way,
    // it will register itself into itself.
    $this->extensionAdd('WjsLoader', 'WjsLoader', new \Wjs5\Loader\WjsLoader($this));
    // Scan core extensions.
    $this->scanFolderExtensions(WJS5_ROOT . 'extension/', array(), array(), array(
      // Do not reload WjsLoader.
      'WjsLoader' => array(
        'WjsLoader'
      )
    ));

    if ($this->optionGet('staticFilesEnabled')) {

      // Find cache path from client side.
      $this->optionSet('clientPathCache', $this->clientPath($this->optionGet('serverPathCache')));

      // If token sent in URL, use it as cacheToken.
      $paramName = $this->optionGet('paramToken');
      if ($paramName && isset($_GET[$paramName])) {
        $this->optionSet('cacheToken', $_GET[$paramName]);
      }

      // Enable caching if folder is set.
      $serverPathCache = $this->optionGet('serverPathCache');

      // Check that directory exists for file.
      if (file_exists($serverPathCache) && is_dir($serverPathCache) && is_writable($serverPathCache)) {
        // Add specific extension for cache management.
        $this->extensionPush('WjsLoader', 'CacheLink');
      }
      else {
        // Empty variable.
        $this->optionSet('staticFilesEnabled', FALSE);
        // Trigger error.
        $this->error('Path cache not found or not writable : ' . $serverPathCache);
      }
    }

    // Auto create response.
    if ($this->optionGet('autoResponse')) {
      $this->ajax();
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
   * Shorthand function name for extension add + push.
   */
  function import($extensionType, $extensionName, $value = NULL) {
    // Some loaders supports null value.
    $this->extensionAdd($extensionType, $extensionName, $value);
    $this->extensionPush($extensionType, $extensionName);
  }

  /**
   * Transform $_GET style array to w response package.
   *
   * @param null $get
   */
  function response($get = NULL) {
    if ($get !== NULL) {
      // Parse get request.
      $requests = $this->queryExplode($get[$this->optionGet('paramInc')]);
      // Exclude must be boolean or array,
      // param for true is "1".
      if (isset($get[$this->optionGet('paramExc')])) {
        $exclude = $get[$this->optionGet('paramExc')];
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
      $this->extensionExclude = $exclude;
      // Push array of extension.
      $this->extensionPushRequest($requests);
    }
    header('Content-Type: application/json');
    print $this->responsePackage();
    exit;
  }

  /**
   * Run response only if ajax query is detected.
   */
  function ajax() {
    if (isset($_GET) && isset($_GET[$this->optionGet('paramInc')])) {
      $this->response($_GET);
    }
  }

  /**
   * Return an existing extension loader.
   *
   * @param string $name
   *
   * @return \Wjs5\Loader
   */
  function loaderGet($name) {
    if (!isset($this->loaders[$name])) {
      // Try to add extension from queue.
      $this->extensionAddQueueLoad('WjsLoader', $name);
    }
    return isset($this->loaders[$name]) ? $this->loaders[$name] : FALSE;
  }

  /**
   * Register extension file / folder into available list of extensions.
   * This will not push extension to output package.
   */
  function extensionAdd($extensionType, $extensionName, $settings, $requirements = array(), $infoFile = FALSE) {
    $info = $this->infoFileLoad($infoFile);
    if (isset($info['require'])) {
      $requirements = array_merge_recursive($requirements, $info['require']);
    }
    foreach ($requirements as $requiredType => $requiredNames) {
      foreach ($requiredNames as $requiredName) {
        // Manage sub dependencies.
        $this->extensionAddQueueLoad($requiredType, $requiredName);
      }
    }
    // Find the good class name.
    $className = '\Wjs5\Loader\\' . $extensionType . '\\Extension';
    // Use default class if missing.
    $className = class_exists($className) ? $className : '\\Wjs5\\Extension';
    // Build instance.
    /* @var Extension $extension */
    new $className($this, $extensionType, $extensionName, $settings);
    // Apply given requirements.
    $this->extensionAddRequireArray($extensionType, $extensionName, $requirements);
  }

  function infoFileLoad($filePath) {
    return is_file($filePath) ? json_decode(file_get_contents($filePath), JSON_OBJECT_AS_ARRAY) : array();
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
   * @param $options
   */
  function extensionAddRequire($extensionType, $extensionName, $requireType, $requireName, $options = array()) {
    // Core extensions requirement is assumed.
    if ($this->isCoreExtension($requireType, $requireName)) {
      return;
    }
    // Check extension.
    $extension = $this->extensionGet($extensionType, $extensionName);
    if (!$extension) {
      // Trigger error.
      $this->error('Requiring extension not found : ' . $extensionType . '::' . $extensionType);
    }
    // Only one dependency.
    if (isset($extension->require[$requireType . '::' . $requireName])) {
      return;
    }
    // Check requirement.
    $require = $this->extensionGet($requireType, $requireName);
    if (!$require) {
      // Trigger error.
      $this->error('Required extension not found : ' . $requireType . '::' . $requireName . ' (used by ' . $extensionType . '::' . $extensionName . ')');
    }
    if (is_object($extension)) {
      // Set requirement.
      new ExtensionDependency($this, $extension, $require, $options);
    }
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
    // Check if extension is not pending.
    $this->extensionAddQueueLoad($extensionType, $extensionName);
    // Prevent recursion by getting loader manually.
    $loader = $this->loaders[$extensionType];
    if ($loader) {
      // Extension still not exists.
      if (!isset($loader->extensions[$extensionName])) {
        $loader->extensionGetMissing($extensionName);
      }
      if (isset($loader->extensions[$extensionName])) {
        return $loader->extensions[$extensionName];
      }
      return new \Wjs5\ExtensionMissing($this, $extensionType, $extensionName, WJS5_ERR_PUSH_UNDEFINED_EXTENSION_NAME);
    }
    return new \Wjs5\ExtensionMissing($this, $extensionType, $extensionName, WJS5_ERR_PUSH_UNDEFINED_EXTENSION_TYPE);
  }

  /**
   * Add previously registered function to the output package.
   *
   * @param            $extensionType
   * @param            $extensionName
   * @param array      $options
   *
   * @return mixed
   */
  function extensionPush($extensionType, $extensionName, $options = array()) {
    // Do not push core loaders.
    if ($this->isCoreExtension($extensionType, $extensionName)) {
      return NULL;
    }
    /* @var \Wjs5\Extension $extension */
    $extension = $this->extensionGet($extensionType, $extensionName);
    if (!$extension->pushCache() && !$this->extensionIsPushed($extensionType, $extensionName)) {
      // Executed once for each extension,
      // contain common data.
      $extension->push();
    }
    // Dependencies...
    $extension->pushDependencies();
    // Save.
    $this->extensionsPushed[$extensionType][$extensionName] = $extension;
    // Execute at each push.
    $instance               = $extension->instance($options);
    $extension->instances[] = $instance;
    return $instance;
  }

  /**
   * Push extensions from the given list.
   *
   * @param $requestArray
   */
  function extensionPushRequest($requestArray) {
    // Iterate over types.
    foreach ($requestArray as $type => $items) {
      // Iterate over items.
      foreach ($items as $name => $options) {
        if (!is_array($options)) {
          $this->extensionPush($type, $options);
        }
        else {
          $this->extensionPush($type, $name, $options);
        }
      }
    }
  }

  function extensionIsPushed($extensionType, $extensionName) {
    return isset($this->extensionsPushed[$extensionType][$extensionName]);
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
   * Return true if extension is part of the w core,
   * which is no need to be loaded or required as dependency.
   *
   * @param $extensionType
   * @param $extensionName
   *
   * @return bool
   */
  function isCoreExtension($extensionType, $extensionName) {
    // Core loaders.
    return ($extensionType === 'WjsLoader' && ($extensionName === 'WjsLoader' || $extensionName === 'JsLink'));
  }

  /**
   * Return json encoded response.
   * @return string
   */
  function responsePackage() {
    $output = array();
    foreach ($this->extensionsPushed as $extensionType => $extensions) {
      foreach ($extensions as $extensionName => $extension) {
        if (!$extension->outputHidden) {
          $output[$extensionType][$extensionName] = $extension->output();
          // TODO TEMP
          unset($this->outputPackage[$extensionType][$extensionName]);
        }
      }
    }
    $output = array_merge_recursive($this->outputPackage, $output); // TODO TEMP REMOVE THIS LINE
    return (!empty($output)) ? json_encode($output) : '{}';
  }

  /**
   * Return json containing loaded extensions,
   * ready to parse on page loading.
   */
  function initPackage() {
    // Use path option.
    $settings   = array_merge($this->settings, array(
      'version'              => WJS5_VERSION,
      'clientName'           => $this->optionGet('clientName'),
      'paramExtra'           => $this->optionGet('paramExtra'),
      'paramInc'             => $this->optionGet('paramInc'),
      'paramExc'             => $this->optionGet('paramExc'),
      'paramToken'           => $this->optionGet('paramToken'),
      'pathResponse'         => $this->optionGet('clientPathResponse'),
      'pathFull'             => $this->optionGet('clientPathFull'),
      'pathWebsite'          => $this->optionGet('clientPathWebsite'),
      'pathRequest'          => $this->optionGet('clientRequest'),
      'pathRequestDirectory' => $this->optionGet('clientRequestDirectory'),
      'cachePath'            => $this->optionGet('clientPathCache'),
      'cacheToken'           => $this->optionGet('cacheToken'),
    ));
    $outputJson = array();
    // Add settings.
    $outputJson[] = '"settings":' . json_encode($settings);
    // Create a list of loaders who are added,
    // but no script file for them, so we need to
    // build them at startup.
    $loadersBasic = array();
    foreach ($this->loaders as $loader) {
      if ($loader->hasJsFile === FALSE) {
        $loadersBasic[] = $loader->type;
      }
    }
    $outputJson[] = '"loadersBasic":' . json_encode($loadersBasic);
    // Add list of WjsLoader available remotely,
    // it prevent w to fail when retrieving undefined loaders.
    $outputJson[] = '"loadersExtra":' . json_encode(array_keys($this->loaderGet('WjsLoader')->extensions));
    // Load functions and class called in server side for this page.
    $jsPackage = $this->responsePackage();
    if ($jsPackage !== NULL) {
      $outputJson[] = '"packageDefault":' . $jsPackage;
    }
    // Add object brackets.
    return (!empty($outputJson)) ? '{' . implode(',', $outputJson) . '}' : '';
  }

  function cssFiles($side = 'client', $render = FALSE) {
    $files = array();
    /* @var \Wjs5\Loader $loader */
    foreach ($this->loaders as $loader) {
      $loader->headerFiles('css', $files, $side, $render);
    }
    return $files;
  }

  /**
   * List of required javascript files for w to works properly.
   * It includes loader's javascript from core and extra loaders
   * append from external applications.
   */
  function jsFiles($side = 'client', $render = FALSE) {
    $basePath = $this->optionGet($side . 'PathWjs');
    // Add core file.
    $files = array();
    foreach ($this->jsCoreFiles[$this->subversion] as $file) {
      $files[] = $basePath . $file;
    }
    /* @var \Wjs5\Loader $loader */
    foreach ($this->loaders as $loader) {
      $loader->headerFiles('js', $files, $side, $render);
    }
    return $files;
  }

  /**
   * Convert a path.js to path.min.js.
   *
   * @param $path
   * @param $extension
   *
   * @return string
   */
  function filePathMin($path, $extension) {
    return substr($path, 0, -strlen('.' . $extension)) . '.min.' . $extension;
  }

  function filePathMinExists($path, $extension) {
    // No minified file allowed when source
    // subversion is used.
    if ($this->subversion !== 'source') {
      // Get minified file name.
      $min = $this->filePathMin($path, $extension);
      // It must exist.
      if (file_exists($min)) {
        return $min;
      }
    }
    return $path;
  }

  /**
   * Return the .min.js file path of a given file
   * if exists and current w version is master.
   */
  function jsFileVersioned($jsFile) {
    if ($this->subversion === 'master') {
      // Use minified files if exists.
      $jsMin = $this->filePathMin($jsFile, 'js');
      if (is_file($jsMin)) {
        return $jsMin;
      }
    }
    return $jsFile;
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
    // Names can't contain space, new lines, or backslash.
    preg_match_all('`@require\\s*([^\\s\\r\\n\\\\]*)\\s*>\\s*([^\\s\\r\\n\\\\]*)`', $jsContent, $results);
    foreach ($results[0] as $key => $item) {
      if ($this->loaderGet($extensionType)->allowRequireJs) {
        $this->extensionAddRequire($extensionType, $extensionName, trim($results[1][$key]), trim($results[2][$key]));
      }
    }
  }

  function findLinksClassFile($classPath, $type) {
    $info         = pathinfo($classPath);
    $linkFile     = $info['filename'] . '.' . $type;
    $linkFilePath = $this->pathDirName($classPath) . '/' . $linkFile;
    if (is_file($linkFilePath)) {
      return $linkFilePath;
    }
    return FALSE;
  }

  function extensionsAddLink($classPath, $type, $extensionType, $extensionName) {
    // Get "JsLinks" name from "js" type.
    $requireType  = ucfirst($type) . 'Link';
    $linkFilePath = $this->findLinksClassFile($classPath, $type);
    $linkFilePath = $this->filePathMinExists($linkFilePath, $type);
    if ($linkFilePath) {
      $clientPath = $this->clientPath($linkFilePath);
      // Add.
      $this->extensionAdd($requireType, $clientPath, array(
        'serverPath' => $linkFilePath,
        'clientPath' => $clientPath,
      ));
      $this->extensionAddRequire($extensionType, $extensionName, $requireType, $clientPath);
      return $clientPath;
    }
    return FALSE;
  }

  /**
   * Return all needed scripts for HTML head to init w.
   *
   * @param int $indentLength Allow links to be indented.
   *
   * @return string
   */
  function renderHeader($indentLength = 0) {
    $output = '';
    $indent = $indentLength === 0 ? '' : "\r\n" . str_repeat(' ', $indentLength);
    // Append css files.
    $output .= $this->renderHeaderLinks('css', $this->cssFiles('client', TRUE), $indent);
    // Append loaders for pushed extensions,
    // it allow to parse startup package completely.
    // It is not placed progressively during push,
    // to avoid to mix behavior with response package.
    foreach ($this->outputPackage as $type => $items) {
      $this->extensionPush('WjsLoader', $type);
    }
    // In case of cache we aggregate files in one.
    if ($this->optionGet('aggregationEnabled')) {
      $aggregationFileName = $this->optionGet('aggregationFileName');
      $aggregationFileName = $this->optionGet('serverPathCache') . ($aggregationFileName ? $aggregationFileName : 'w' . $this->optionGet('cacheToken') . '.js');
      $files               = $this->jsFiles('server', TRUE);
      // Create file.
      if ($this->optionGet('aggregationFlush') === TRUE || !is_file($aggregationFileName)) {
        $cacheContent = '';
        foreach ($files as $file) {
          $cacheContent .= "\r\n" . file_get_contents($file);
        }
        // Create file on server.
        file_put_contents($aggregationFileName, $cacheContent . $this->renderJsUnpacker());
      }
      // Add link from client.
      $output .= $indent . $this->renderJsInclude($this->clientPath(realpath($aggregationFileName)));
    }
    else {
      $output .= $this->renderHeaderLinks('js', $this->jsFiles('client', TRUE), $indent);
      $output .= $indent . $this->renderJsInclude(FALSE, $this->renderJsUnpacker());
    }
    return $output;
  }

  function renderHeaderLinks($type, $files, $indent) {
    $output       = '';
    $methodRender = 'render' . ucfirst($type) . 'Include';
    foreach ($files as $file) {
      $output .= $indent . $this->$methodRender($file);
    }
    return $output;
  }

  /**
   * Render standard javascript file include.
   *
   * @param        $path
   * @param string $inline
   *
   * @return string
   */
  function renderJsInclude($path, $inline = '') {
    return '<script type="text/javascript"' . ($path ? ' src="' . $this->includeLink($path) . '"' : '') . '>' . $inline . '</script>';
  }

  /**
   * Render standard css sheet include.
   */
  function renderCssInclude($path) {
    return '<link rel="stylesheet" media="all" type="text/css" href="' . $this->includeLink($path) . '" />';
  }

  function includeLink($path) {
    if ($this->optionGet('cacheFlush')) {
      if (strpos($path, '?') === FALSE) {
        $path .= '?';
      }
      else {
        // TODO : Check url encoding on node import.
        $path .= '&';
      }
      $path .= 'c=' . $this->cacheToken;
    }
    return $path;
  }

  /**
   * Render javascript used to start w.
   * @return string
   */
  function renderJsUnpacker() {
    return 'new ' . ($this->subversion === 'jQuery' ? 'jQuery' : 'window') . '.W(' . $this->initPackage() . ');';
  }

  var $extensionsAddQueue = array();

  /**
   * Search for extensions into a folder.
   * Allows to transmit data options for all extensions found.
   * Allow to define a loading order, to respect dependencies.
   */
  function scanFolderExtensions($directory, $globalData = array(), $order = array(), $exclude = array()) {
    // Prevent errors.
    if (!is_dir($directory)) {
      return;
    }
    // Allow multidimensional arrays.
    $orderBase = isset($order[0]) ? $order : array_keys($order);
    // If WjsLoader exists, and not specified into ordered list
    // prepend it to scan before every other types.
    if (is_dir($directory . 'WjsLoader') && !isset($order['WjsLoader'])) {
      if (($key = array_search('WjsLoader', $orderBase)) !== FALSE) {
        unset($orderBase[$key]);
      }
      array_unshift($orderBase, 'WjsLoader');
    }
    // This function allow to take symlinks as argument,
    // but scandir fails to explore recursive links, so we have
    // to use real path as base path for exploration.
    $directoryRealPath = realpath($directory);
    $scan              = $this->scanFolderOrdered($directoryRealPath . '/', $orderBase);
    // Create scan registry.
    $queue = array();
    foreach ($scan as $extensionType) {
      if ($extensionType{0} !== '.' && !in_array($extensionType, $exclude)) {
        $queue[$extensionType]  = array();
        $scanExtensionDirectory = $directoryRealPath . '/' . $extensionType . '/';
        if (file_exists($scanExtensionDirectory)) {
          $scanExtension = $this->scanFolderOrdered($scanExtensionDirectory, isset($extensionType[$extensionType]) ? $orderBase[$extensionType] : array());
          foreach ($scanExtension as $file) {
            if ($file{0} !== '.') {
              $info          = pathinfo($directory . $file);
              $extensionName = $info['filename'];
              if (!isset($exclude[$extensionType]) || !in_array($extensionName, $exclude[$extensionType])) {
                $queue[$extensionType][$extensionName] = array(
                  'file'       => $file,
                  'directory'  => $scanExtensionDirectory,
                  'globalData' => $globalData
                );
              }
            }
          }
        }
      }
    }

    // Merge to global queue.
    $this->extensionsAddQueue = array_merge_recursive($this->extensionsAddQueue, $queue);
    // Treat only locally discovered extensions.
    foreach ($queue as $extensionType => $extensions) {
      $loader = $this->loaderGet($extensionType);
      if ($loader) {
        foreach ($extensions as $extensionName => $data) {
          $this->extensionAddQueueLoad($extensionType, $extensionName);
        }
      }
    }
  }

  /**
   * Add extension found from directory scan.
   * Use global registry to manage dependencies defined into info files.
   */
  function extensionAddQueueLoad($extensionType, $extensionName) {
    // Get user manually to prevent recursions.
    $loader = $this->loaders[$extensionType];
    // It have been queued.
    if (!isset($loader->extensions[$extensionName]) &&
      isset($this->extensionsAddQueue[$extensionType]) &&
      isset($this->extensionsAddQueue[$extensionType][$extensionName])
    ) {
      // Get saved path.
      $settings = $this->extensionsAddQueue[$extensionType][$extensionName];
      $loader->scanFolderItem($settings['directory'], $settings['file'], $settings['globalData']);
      // Clean registry.
      unset($this->extensionsAddQueue[$extensionType][$extensionName]);
    }
  }

  /**
   * Scan a directory, but sort result
   * in a specified order, for known results.
   */
  function scanFolderOrdered($directory, $order = array()) {
    return array_merge($order, array_diff(scandir($directory), $order));
  }

  /**
   * Append a trailing slash if missing.
   */
  function pathAddSlash($path) {
    return $path . (substr($path, -1) !== '/' ? '/' : '');
  }

  /**
   * Allow optional arguments for this function,
   * it will be replaced by default website paths.
   * Absolute path is expected, use realpath() to find it,
   * it is not used internally to let work
   * with non existing files paths.
   */
  function clientPath($serverPathAbsolute, $serverWorkingDirectory = NULL, $clientRequestDirectory = NULL) {
    return parent::clientPath($serverPathAbsolute,
      // Subtract cwd.
      $serverWorkingDirectory !== NULL ? $serverWorkingDirectory : $this->optionGet('serverWorkingDirectory'),
      // Subtract website base directory (add ../.. to site client root).
      $clientRequestDirectory !== NULL ? $clientRequestDirectory : $this->optionGet('clientRequestDirectory'));
  }

  /**
   * Relocate client path relative to root
   * to current client directory.
   */
  function clientPathRebase($path) {
    $root = $this->optionGet('clientRequestDirectory');
    // Get path relative to site client root.
    return ($root === '/' ? '' : $this->pathRelative($this->optionGet('clientRequestDirectory'), '')) . $path;
  }

  /**
   * @param $html string
   *
   * @return \DOMElement
   */
  function htmlLoad($html) {
    // Parse with native PHP dom parser.
    $dom = new \DOMDocument;
    // Remove errors like parsing non encoded question marks in urls.
    libxml_use_internal_errors(TRUE);
    // We need to add main wrappers around our document content.
    $wrapped = '<div>' . $html . '</div>';
    $domSave = NULL;
    // Load depending of PHP version.
    // Do not work wit PHP 5.4.38 && libxml 2.7.8
    // But works with PHP 5.5.9 && libxml 2.9.1
    if (version_compare(PHP_VERSION, '5.5.0') >= 0) {
      $dom->loadHTML($wrapped, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    }
    // Version under PHP 5.4 do not support second argument in loadHTML,
    // so we have to remove manually
    else {
      $dom->loadHTML($wrapped);
      // Remove doctype.
      $dom->removeChild($dom->doctype);
      // Search for our div through html / body tags.
      $dom->replaceChild($dom->firstChild->firstChild->firstChild, $dom->firstChild);
    }
    return $dom;
  }

  /**
   * @param $dom \DOMDocument
   *
   * @return string
   */
  function htmlSave($dom) {
    // Convert to text.
    $html = $dom->saveHTML();
    // Remove the temporary wrapper.
    return trim(preg_replace('!^<div>([\s\S]*?)</div>$!i', '$1', $html));
  }

  function htmlRebase($html, $basePath) {
    // Parse with native PHP dom parser.
    $dom = new \DOMDocument;
    // Remove errors like parsing non encoded question marks in urls.
    libxml_use_internal_errors(TRUE);
    // We need to add main wrappers around our document content.
    $wrapped = '<div>' . $html . '</div>';
    $domSave = NULL;
    // Load depending of PHP version.
    if (version_compare(PHP_VERSION, '5.4.0') >= 0) {
      $dom->loadHTML($wrapped, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    }
    // Version under PHP 5.4 do not support second argument in loadHTML,
    // so we have to remove manually
    else {
      $dom->loadHTML($wrapped);
      // Remove doctype.
      $dom->removeChild($dom->doctype);
      // Search for our div through html / body tags.
      $dom->replaceChild($dom->firstChild->firstChild->firstChild, $dom->firstChild);
    }
    // Replace images src.
    $images = $dom->getElementsByTagName('img');
    /** @var \DOMElement $image */
    foreach ($images as $image) {
      $src = $image->getAttribute('src');
      // Relocate images from extensions location.
      // Ignore full paths and template {{markups}}.
      if ($src && substr($src, 0, 4) !== 'http' && substr($src, 0, 2) !== '{{') {
        $image->setAttribute('src', $basePath . $image->getAttribute('src'));
      }
    }
    // Convert to text.
    $html = $dom->saveHTML();
    // Remove the temporary wrapper.
    $html = trim(preg_replace('!^<div>([\s\S]*?)</div>$!i', '$1', $html));
    // Return rebased.
    return $html;
  }
}
