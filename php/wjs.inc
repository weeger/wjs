<?php

define('WJS_VERSION', '[$version]');
define('WJS_PUSH_HIDDEN_EXTENSION', 'WJS_PUSH_HIDDEN_EXTENSION');
define('WJS_ERR_PUSH_UNDEFINED_EXTENSION_NAME', 'WJS_ERR_PUSH_UNDEFINED_EXTENSION_NAME');
define('WJS_ERR_PUSH_UNDEFINED_EXTENSION_TYPE', 'WJS_ERR_PUSH_UNDEFINED_EXTENSION_TYPE');

if (!defined('WJS_ROOT')) {
  // Wjs root contains path to this file like and
  // can be defined externally in order to keep
  // unresolved symlinks to wjs, when used.
  // It has better results on client relative
  // paths detection. This behavior is due to PHP
  // limitation who always resolve symlinks and
  // do not let a method to find unresolved paths.
  define('WJS_ROOT', dirname(dirname(__FILE__)) . '/');
}

require_once WJS_ROOT . 'php/router.inc';
require_once WJS_ROOT . 'php/loader.inc';
require_once WJS_ROOT . 'extension/WjsLoader/JsLink/JsLink.inc';
require_once WJS_ROOT . 'extension/WjsLoader/WjsLoader/WjsLoader.inc';

use \Wjs\Router;

class Wjs extends Router {
  /**
   * Options can be defined by user.
   * @var array
   */
  var $optionsDefault = array(
    'serverPathCache'     => FALSE, // Cache directory.
    'clientPathCache'     => '', // Cache directory.
    'staticFilesEnabled'  => FALSE, // Name of aggregated wjs file.
    'staticFilesFlush'    => FALSE, // Allow to override existing files.
    // These options will be transmitted to JS,
    // that's why some parameters are shorts.
    'aggregationFileName' => FALSE, // Name of aggregated wjs file.
    'clientName'          => 'wjs', // Wjs javascript object name like window.wjs.
    'paramExtra'          => '', // Parameters appended to AJAX requests.
    'paramInc'            => 'wjs', // Name of AJAX parameter.
    'paramExc'            => 'wjs-exc', // Name of AJAX parameter (exclusions)
    'paramToken'          => 'wjs-tok', // Name of URL extra token (AJAX and cache flush)
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
   * Contain list of excluded extension
   * from output package.
   * @var array
   */
  var $extensionExclude = array();
  /**
   * Allow to send user extra settings
   * to client side wjs instance.
   * @var array
   */
  var $settings = array();

  /**
   * Initialize wjs.
   * Can take multiple options types, if no option, try
   * to detect current wjs location path, if a string is
   * given, consider it as location path. in other case
   * user argument as options collection.
   */
  function __construct($options = array()) {
    parent::__construct($options);

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
    // - /path/to/root/
    if ($this->optionGet('clientPathWebsite') === NULL) {
      // Find base path by intersecting requested URI and script path.
      $this->optionSet('clientPathWebsite', $this->pathAddSlash(implode('/', array_intersect(
        explode('/', $this->optionGet('clientPathFull')),
        explode('/', dirname($_SERVER['SCRIPT_NAME']) . '/')
      ))));
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
    $this->optionSet('clientPathResponse', $this->pathClientRebase($this->optionGet('clientPathResponse')));

    // Define relative path of wjs folder,
    // with cwd and unresolved root path.
    $this->optionSet('serverPathWjs', $this->pathRelative(
    // Use cwd as base path.
      $this->optionGet('serverWorkingDirectory'),
      // Subtract link.
      WJS_ROOT));

    // Fill wjs client path if still missing.
    // Defining it manually can be useful
    // when URL rewriting is used.
    if (!$this->optionGet('clientPathWjs')) {
      $this->optionSet('clientPathWjs', $this->pathClient(WJS_ROOT));
    }

    // Define core version.
    $this->jsCoreFilesVersion = isset($options['jsCoreFilesVersion']) ? $options['jsCoreFilesVersion'] : 'master';

    // Add core loaders.
    $filePath                   = 'extension/WjsLoader/WjsLoader/WjsLoader';
    $wjsLoaderData              = array(
      'serverPathClass' => $this->optionGet('serverPathWjs') . $filePath . '.inc',
      'serverPathJs'    => $this->optionGet('serverPathWjs') . $filePath . '.min.js',
      'clientPathJs'    => $this->optionGet('clientPathWjs') . $filePath . '.min.js',
    );
    $this->loaders['WjsLoader'] = new \Wjs\Loader\WjsLoader($wjsLoaderData, $this);
    $this->loaders['WjsLoader']
      ->extensions['WjsLoader'] = $wjsLoaderData;

    // Scan core extensions.
    $this->scanFolderExtensions(WJS_ROOT . 'extension/', array(), array(
      'WjsLoader' => array(
        'WjsLoader',
        'JsLink',
        'JsScript',
        'JsMethod',
      )
    ));

    if ($this->optionGet('staticFilesEnabled')) {

      // Find cache path from client side.
      $this->optionSet('clientPathCache', $this->pathClient($this->optionGet('serverPathCache')));

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
    if (!$this->extensionGet($extensionType, $extensionName)) {
      // Some loaders supports null value.
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
   * @return \Wjs\Loader
   */
  function loaderGet($name) {
    return isset($this->loaders[$name]) ? $this->loaders[$name] : FALSE;
  }

  /**
   * Register extension file / folder into available list of extensions.
   * This will not push extension to output package.
   */
  function extensionAdd($extensionType, $extensionName, $extensionData, $requirements = array()) {
    // Save extensions into according loader.
    $this->loaderGet($extensionType)->extensionAdd($extensionName, $extensionData);
    // Apply given requirements.
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
   * @param $pushOptions
   */
  function extensionAddRequire($extensionType, $extensionName, $requireType, $requireName, $pushOptions = array()) {
    // Save requirement into according loader.
    $this->loaderGet($extensionType)->extensionAddRequire($extensionName, $requireType, $requireName, $pushOptions);
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
    $loader = $this->loaderGet($extensionType);
    if ($loader && isset($loader->extensions[$extensionName])) {
      return $loader->extensions[$extensionName];
    }
    return FALSE;
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
    $loader = $this->loaderGet($extensionType);
    if ($loader) {
      $useJsCache = $this->optionGet('staticFilesEnabled') && $loader->allowJsCache;
      if ($useJsCache) {
        // Get path for this specific type.
        $pathCache = $extensionType . '/' . $extensionName . $this->optionGet('cacheToken') . '.js';
        // Get path for file on the server.
        $pathCacheServer    = $this->optionGet('serverPathCache') . $pathCache;
        $pathCacheServerDir = dirname($pathCacheServer);
        // Add new dependency.
        $this->register('CacheLink', $pathCache, $this->optionGet('serverPathCache') . $pathCache);
        // Add JsLink requirement.
        $this->extensionAddRequire($extensionType, $extensionName, 'CacheLink', $pathCache);
        // Build output package.
        $extensionData = $loader->extensionPush($extensionName, $options);
        // Avoid missing extensions errors.
        if ($extensionData !== WJS_ERR_PUSH_UNDEFINED_EXTENSION_NAME) {
          // Recreate cache file.
          if ($this->optionGet('staticFilesFlush') === TRUE || !is_file($pathCacheServer)) {
            // Create directory.
            if (!is_dir($pathCacheServerDir)) {
              mkdir($pathCacheServerDir);
            }
            // Create file.
            file_put_contents($pathCacheServer,
              'WjsProto.cache("' . $extensionType . '","' . $extensionName . '",' . $loader->cacheJsEncode($extensionData['#data']) . ');');
          }
          // Replace data by logical cache path.
          $extensionData['#data'] = 'cache://' . $pathCache;
        }
      }
      else {
        // Build output package.
        $extensionData = $loader->extensionPush($extensionName, $options);
      }
    }
    else {
      $extensionData = WJS_ERR_PUSH_UNDEFINED_EXTENSION_TYPE;
    }
    // Save into loader.
    $loader->extensionsPushed[$extensionName] = $extensionData;
    // Allow to not really push data to client side.
    if ($extensionData !== WJS_PUSH_HIDDEN_EXTENSION) {
      // Save into output package.
      $this->outputPackage[$extensionType][$extensionName] = $extensionData;
    }
    // Return saved data.
    return $loader->extensionsPushed[$extensionName];
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
      foreach ($items as $name) {
        $this->extensionPush($type, $name);
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
   * Return true if extension is part of the wjs core,
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
    return (!empty($this->outputPackage)) ? json_encode($this->outputPackage) : '{}';
  }

  /**
   * Return json containing loaded extensions,
   * ready to parse on page loading.
   */
  function initPackage() {
    // Use path option.
    $settings   = array_merge($this->settings, array(
      'version'              => WJS_VERSION,
      'clientName'           => $this->optionGet('clientName'),
      'paramExtra'           => $this->optionGet('paramExtra'),
      'paramInc'             => $this->optionGet('paramInc'),
      'paramExc'             => $this->optionGet('paramExc'),
      'paramToken'           => $this->optionGet('paramToken'),
      'pathResponse'         => $this->optionGet('clientPathResponse'),
      'pathFull'             => $this->optionGet('clientPathFull'),
      'pathWebsite'          => $this->optionGet('clientPathWebsite'),
      'pathRequest'          => $this->optionGet('clientPathRequest'),
      'pathRequestDirectory' => $this->optionGet('clientRequestDirectory'),
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
    // it prevent wjs to fail when retrieving undefined loaders.
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
    /* @var \Wjs\Loader $loader */
    foreach ($this->loaders as $loader) {
      $loader->headerFiles('css', $files, $side, $render);
    }
    return $files;
  }

  /**
   * List of required javascript files for wjs to works properly.
   * It includes loader's javascript from core and extra loaders
   * append from external applications.
   */
  function jsFiles($side = 'client', $render = FALSE) {
    $basePath = $this->optionGet($side . 'PathWjs');
    // Add core file.
    $files = array();
    foreach ($this->jsCoreFiles[$this->jsCoreFilesVersion] as $file) {
      $files[] = $basePath . $file;
    }
    /* @var \Wjs\Loader $loader */
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
    $min = $this->filePathMin($path, $extension);
    if (file_exists($min)) {
      return $min;
    }
    return $path;
  }

  /**
   * Return the .min.js file path of a given file
   * if exists and current wjs version is master.
   */
  function jsFileVersioned($jsFile) {
    if ($this->jsCoreFilesVersion === 'master') {
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

  function requireLinksClassFile($classPath, $type, $extensionType, $extensionName) {
    // Get "JsLinks" name from "js" type.
    $requireType  = ucfirst($type) . 'Link';
    $linkFilePath = $this->findLinksClassFile($classPath, $type);
    if ($linkFilePath) {
      $clientPath = $this->pathClient($linkFilePath);

      // Add && Push.
      $this->extensionAdd($requireType, $clientPath, array(
        'server' => $linkFilePath,
        'client' => $clientPath
      ));
      $this->extensionAddRequire($extensionType, $extensionName, $requireType, $clientPath);
      return $clientPath;
    }
    return FALSE;
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
    $indent = $indentLength === 0 ? '' : "\r\n" . str_repeat(' ', $indentLength);
    // Append css files.
    $output .= $this->renderHeaderLinks('css', $this->cssFiles('client', TRUE), $indent);
    // Append loaders for pushed extensions,
    // it allow to parse start package completely.
    // It is not placed progressively during push,
    // to avoid to mix behavior with response package.
    foreach ($this->outputPackage as $type => $items) {
      $this->extensionPush('WjsLoader', $type);
    }
    // In case of cache we aggregate files in one.
    if ($this->optionGet('aggregationEnabled')) {
      $aggregationFileName = $this->optionGet('aggregationFileName');
      $aggregationFileName = $this->optionGet('serverPathCache') . ($aggregationFileName ? $aggregationFileName : 'wjs' . $this->optionGet('cacheToken') . '.js');
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
      $output .= $indent . $this->renderJsInclude($this->pathClient($aggregationFileName));
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
    return '<script type="text/javascript"' . ($path ? ' src="' . $path . '"' : '') . '>' . $inline . '</script>';
  }

  function renderCssInclude($file) {
    return '<link rel="stylesheet" media="all" type="text/css" href="' . $file . '" />';
  }

  /**
   * Render javascript used to start wjs.
   * @return string
   */
  function renderJsUnpacker() {
    return 'new ' . ($this->jsCoreFilesVersion === 'jQuery' ? 'jQuery' : 'window') . '.WjsProto(' . $this->initPackage() . ');';
  }

  /**
   * Search for extensions into a folder.
   * Allows to transmit data options for all extensions found.
   * Allow to define a loading order, to respect dependencies.
   */
  function scanFolderExtensions($directory, $globalData = array(), $order = array()) {
    // Allow multidimensional arrays.
    $orderBase = isset($order[0]) ? $order : array_keys($order);
    // If WjsLoader exists, prepend it to scan.
    if (is_dir($directory . 'WjsLoader')) {
      array_unshift($orderBase, 'WjsLoader');
    }
    // This function allow to take symlinks as argument,
    // but scandir fails to explore recursive links, so we have
    // to use real path as base path for exploration.
    $scan = $this->scanFolderOrdered(realpath($directory) . '/', $orderBase);
    foreach ($scan as $item) {
      if ($this->loaderGet($item)) {
        // Get item specific params.
        $itemGlobalData = isset($globalData[$item]) ? $globalData[$item] : array();
        $itemOrder      = isset($order[$item]) ? $order[$item] : array();
        $subDirectory   = $directory . $item . '/';
        // As directories can be manually ordered,
        // directory may not exists.
        if (is_dir($subDirectory)) {
          $this->loaderGet($item)->scanFolderExtensions($subDirectory, $itemGlobalData, $itemOrder);
        }
      }
    }
  }

  /**
   * Scan a directory, but sort result
   * in a specified order, for known results.
   */
  function scanFolderOrdered($directory, $order) {
    return array_merge($order, array_diff(scandir($directory), $order));
  }

  /**
   * Append a trailing slash if needed.
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
  function pathClient($pathServerAbsolute, $serverWorkingDirectory = NULL, $clientRequestDirectory = NULL) {
    return parent::pathClient($pathServerAbsolute,
      // Subtract cwd.
      $serverWorkingDirectory !== NULL ? $serverWorkingDirectory : $this->optionGet('serverWorkingDirectory'),
      // Subtract website base directory (add ../.. to site client root).
      $clientRequestDirectory !== NULL ? $clientRequestDirectory : $this->optionGet('clientRequestDirectory'));
  }

  /**
   * Relocate client path relative to root
   * to current client directory.
   */
  function pathClientRebase($path) {
    $root = $this->optionGet('clientRequestDirectory');
    // Get path relative to site client root.
    return ($root === '/' ? '' : $this->pathRelative($this->optionGet('clientRequestDirectory'), '')) . $path;
  }

  function htmlParseIncludeRequire($html, $extensionType, $extensionName, $options = array()) {
    $result = array();
    // Search for <div data-wjsInclude="...">
    // Get text content if present.
    preg_match_all('`<div[^<]*data\\-wjsInclude="([^"]*)\:([^"]*)"([^>|\/>])*(?:\/>|(?!\/)>([\s\S]*?)<\/div>)`i', $html, $result);
    foreach ($result[1] as $key => $requireType) {
      $this->extensionAddRequire($extensionType, $extensionName, $requireType, $result[2][$key], $options);
    }
    if (!empty($result[1])) {
      // Automatically push include tag detection.
      $this->extensionPush('JsMethod', 'wjsIncludeInit');
    }
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
      if ($src && substr($src, 0, 4) !== 'http') {
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
