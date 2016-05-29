<?php

namespace Wjs5;

/**
 * Loaders are separated processes used to pack / encode
 * and parse extensions from server side to client site
 * depending from extension type.
 */
abstract class Loader extends Atom {
  /**
   * @var string $type
   */
  var $type;
  /**
   * @var \Wjs5\Wjs $w
   */
  var $w;
  /**
   * Contain list of registered items.
   * @var array
   */
  var $extensions = array();
  var $extensionsPushed = array();
  var $extensionsRequire = array();
  var $extensionsRequireOptions = array();
  var $hasJsFile = FALSE;
  /**
   * Defines if content can be exported to
   * external cache files. It is mainly used
   * to execute javascript without eval method.
   * @var bool
   */
  var $allowJsCache = FALSE;
  var $allowRequireJs = FALSE;
  /**
   * Loaders have inheritance both in PHP
   * and Javascript, we need for that
   * to transmit parent class.
   * @var bool|string
   */
  var $parentClass = FALSE;

  function __construct($options, \Wjs5\Wjs $wjs) {
    parent::__construct($options);
    $reflector       = new \ReflectionClass($this);
    $this->type      = $reflector->getShortName();
    $this->w       = $wjs;
    $this->hasJsFile = $this->optionGet('serverPathJs');
    $this->hasJsFile = file_exists($this->hasJsFile);
    // Get parent class type for
    // javascript inheritance.
    $parent = $reflector->getParentClass();
    if ($parent && $parent->getName() !== 'Wjs\Loader') {
      $this->parentClass = $parent->getShortName();
    }
  }

  /**
   * Register new extension.
   *
   * @param $name
   * @param $data
   */
  function extensionAdd($name, $data) {
    $this->extensions[$name] =
    $this->extensions[$name] = $data;
  }

  /**
   * Link extension to another one,
   * When pushed both extensions will be pushed.
   *
   * @param       $name
   * @param       $requireType
   * @param       $requireName
   * @param array $pushOptions
   */
  function extensionAddRequire($name, $requireType, $requireName, $pushOptions = array()) {
    // Core extensions requirement is assumed.
    if (!$this->w->isCoreExtension($requireType, $requireName)) {
      if (!isset($this->extensionsRequire[$name])) {
        $this->extensionsRequire[$name]        = array();
        $this->extensionsRequireOptions[$name] = array();
      }
      if (!isset($this->extensionsRequire[$name][$requireType])) {
        $this->extensionsRequire[$name][$requireType]        = array();
        $this->extensionsRequireOptions[$name][$requireType] = array();
      }
      // Add requirements only once.
      if (!in_array($requireName, $this->extensionsRequire[$name][$requireType])) {
        $this->extensionsRequire[$name][$requireType][]        = $requireName;
        $this->extensionsRequireOptions[$name][$requireType][] = $pushOptions;
      }
    }
  }

  /**
   * @param       $name
   * @param array $options
   * @param null  $value
   *
   * @return mixed
   */
  function extensionPush($name, $options = array(), $value = NULL) {
    $value = $this->valuePush($name, $value);
    // Package base.
    $package = array(
      '#data' => $value,
    );
    $require = $this->extensionGetRequire($name, $this->w->extensionExclude);
    // Push requirements.
    if (!empty($require)) {
      $requireOutput = $require;
      foreach ($require as $requireType => $items) {
        $requireOutput[$requireType] = array();
        foreach ($items as $key => $requireName) {
          $requireOutput[$requireType][] = $requireName;
          $options                       = $this->extensionsRequireOptions[$name][$requireType][$key];
          $this->w->extensionPush($requireType, $requireName, $options);
        }
      }
      // Save require for javascript parsing.
      $package['#require'] = $requireOutput;
    }
    return $package;
  }

  /**
   * Can be useful, for example when converting
   * javascript files data into javascript links
   * into page header.
   */
  function extensionPushRemove($name) {
    // Remove internally.
    unset($this->extensionsPushed[$name]);
    // Remove into w registry.
    unset($this->w->outputPackage[$this->type][$name]);
    // Cleanup empty entry,
    // it avoid javascript to parse it.
    if (empty($this->w->outputPackage[$this->type])) {
      unset($this->w->outputPackage[$this->type]);
    }
  }

  /**
   * Return the list of direct dependencies for given extension.
   */
  function extensionGetRequire($name, $excludeRequire = array()) {
    $require = array();
    // Get dependencies.
    if (isset($this->extensionsRequire[$name])) {
      // Cache links can't be excluded.
      if ($excludeRequire === TRUE) {
        $excludeRequire = $this->extensionsRequire[$name];
        if (isset($excludeRequire['CacheLink'])) {
          unset($excludeRequire['CacheLink']);
        }
      }
      $require = $this->extensionsRequire[$name];
      // Var can be false at this point.
      if (is_array($excludeRequire)) {
        $requireFiltered = array();
        // Only get non filtered dependencies.
        foreach ($require as $requireType => $requireItems) {
          foreach ($requireItems as $key => $requireName) {
            if (!isset($excludeRequire[$requireType]) || !in_array($requireName, $excludeRequire[$requireType])) {
              if (!isset($requireFiltered[$requireType])) {
                $requireFiltered[$requireType] = array();
              }
              $requireFiltered[$requireType][$key] = $requireName;
            }
          }
        }
        $require = $requireFiltered;
      }
    }
    return $require;
  }

  /**
   * Called when w core is asked for main js files list.
   * Render option defines if list is retrieved for information
   * only, or for final rendering process of html head.
   * It allows scripts tags to not be added via javascript,
   * bu generated on server side on page processing, and also
   * to use cache and aggregation for these files.
   */
  function headerFiles($type, &$files = array(), $side = 'client', $render = FALSE) {
    // Give pushed extensions.
    foreach ($this->extensionsPushed as $extensionName => $pushedData) {
      // Load js from dependencies,
      // duplication is managed into files addition.
      $dependencies = $this->extensionGetRequire($extensionName, $this->w->extensionExclude);
      foreach ($dependencies as $requiredType => $items) {
        foreach ($items as $requiredName) {
          if ($requiredType !== $this->type || $requiredName !== $extensionName) {
            $this->w->loaderGet($requiredType)->headerFilesExtension($type, $files, $side, $render, $requiredName);
          }
        }
      }
      // Exclude non allowed js files.
      if (!$this->w->optionGet('staticFilesEnabled') || $type !== 'js' || $this->allowJsCache) {
        $file = $this->headerFilesExtension($type, $files, $side, $render, $extensionName);
        if ($file && !in_array($file, $files)) {
          $files[] = $file;
        }
      }
    }
  }

  function headerFilesExtension($type, &$files, $side, $render = FALSE, $name) {
    // To override...
    return FALSE;
  }

  /**
   * Used when cacheJs is enabled,
   * basically used to define how to manage script,
   * they may be converted from string to pure js
   * in order to avoid usage of eval method.
   *
   * @param $data
   *
   * @return string
   */
  function cacheJsEncode($data) {
    return json_encode($data);
  }

  /**
   * Choose between internal or external
   * value for given extension to push.
   */
  function valuePush($name, $value = NULL) {
    if ($value === NULL) {
      if (!isset($this->extensions[$name])) {
        return WJS5_ERR_PUSH_UNDEFINED_EXTENSION_NAME;
      }
      return $this->extensions[$name];
    }
    return $value;
  }

  function valueIsError($value) {
    return is_string($value) && strpos($value, 'WJS5_ERR_PUSH') === 0;
  }

  /**
   * Register extensions from a folder content.
   * Each subdirectory is considered as an extension.
   *
   * @param string $directory The directory to scan with a trailing slash
   * @param array  $globalData
   * @param array  $order
   */
  function scanFolderExtensions($directory, $globalData = array(), $order = array()) {
    // Get items ordered.
    $scan = $this->w->scanFolderOrdered($directory, $order);
    foreach ($scan as $item) {
      // Avoid all special folders.
      if ($item{0} !== '.') {
        $this->scanFolderItem($directory, $item, $globalData);
      }
    }
  }

  /**
   * Define what to do width found item
   * placed into a scanned folder.
   * It can be a file or a folder.
   */
  function scanFolderItem($directory, $item, $globalData) {
    // To override...
  }
}
