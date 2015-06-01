<?php

namespace Wjs\Loader\WebPage;

use \Wjs;
use \Wjs\Loader\WjsLibrary\Library;
use \Wjs\Website;
use \Wjs\Loader;

class Page {
  /**
   * @var Website
   */
  var $website;
  /**
   * @var Wjs
   */
  var $wjs;
  /**
   * @var Loader\WebComp
   */
  var $loader;
  var $title = 'Page';
  var $extensionType = 'undefined';
  var $extensionName = 'undefined';
  var $rendered = '';
  var $requirements = array();
  var $libraries = array();
  var $librariesRequired = array();
  var $librariesHookQueue = array();
  var $librariesHookOutput = array();
  var $librariesHookCurrent = '';
  var $serverPath = '';
  var $clientPath = '';
  var $urlAlias = FALSE;

  function __construct($type, $name, $options, Wjs $wjs, Loader $loader, Website $website = NULL) {
    $this->extensionType = $type;
    $this->extensionName = $name;
    // Load own wjs instance.
    $this->wjs     = $wjs;
    $this->loader  = $loader;
    $this->website = $website;
    // Init wjs as normal library.
    $this->libraryLoad('Wjs', array('wjs' => $this->wjs));
    $this->serverPath = $options['server'];
    $this->clientPath = $options['client'];
    // Load required libraries.
    $libraries = $this->librariesRequired;
    // Create list.
    foreach ($libraries as $name => $libraryOptions) {
      if (!is_array($libraryOptions)) {
        $name           = $libraryOptions;
        $libraryOptions = array();
      }
      if (!$this->libraryGet($name)) {
        $this->libraryLoadOnce($name, $libraryOptions);
      }
    }
    // Load other requirements
    foreach ($this->requirements as $extensionType => $extensions) {
      foreach ($extensions as $extensionName) {
        $this->wjs->import($extensionType, $extensionName);
      }
    }
    $lineage = $this->lineageFilesNames();
    // Load associated css / js after requirements.
    foreach ($lineage as $filePath) {
      $this->wjs->requireLinksClassFile($filePath, 'css', 'WebPage', $this->extensionName);
      $js = $this->wjs->requireLinksClassFile($filePath, 'js', 'WebPage', $this->extensionName);
      // Add requirement into own wjs.
      if (is_file($js)) {
        // Import requirements.
        $this->wjs->jsParseRequire('WebPage', $this->extensionName, file_get_contents($js));
      }
    }
  }

  function lineageFilesNames() {
    static $lineage;
    // Only once.
    if (empty($lineage)) {
      // Define location vars.
      $reflector = new \ReflectionClass($this);
      $lineage   = array();
      do {
        $lineage[] = $reflector->getFileName();
      } while ($reflector = $reflector->getParentClass());
      // Revert array to get links in inheritance order.
      $lineage = array_reverse($lineage);
    }
    return $lineage;
  }

  function libraryLoad($name, $options = array()) {
    $options['page'] = $this;
    $this->wjs->extensionPush('WjsLibrary', $name, $options);
    return end($this->libraries);
  }

  function libraryLoadOnce($name, $options = array()) {
    $library = $this->libraryGet($name);
    if (!$library) {
      return $this->libraryLoad($name, $options);
    }
    return $library;
  }

  /**
   * Return the first instance of library.
   *
   * @param $name
   *
   * @return \Wjs\Loader\WjsLibrary\Library
   */
  function libraryGet($name) {
    foreach ($this->libraries as $library) {
      if ($library->name === $name) {
        return $library;
      }
    }
    return FALSE;
  }

  function librariesHook($hookName, &$options = array()) {
    $this->librariesHookQueue[$hookName]  = array();
    $this->librariesHookOutput[$hookName] = array();
    foreach ($this->libraries as $key => $library) {
      $this->libraryHook($library, $hookName, $options, $key);
    }
    // Hook page.
    $pageMethod = 'librariesHook' . ucfirst($hookName);
    if (method_exists($this, $pageMethod)) {
      $this->$pageMethod($this->librariesHookOutput[$hookName], $options);
    }
    // Hook website.
    if ($this->website && method_exists($this->website, $pageMethod)) {
      $this->website->$pageMethod($this->librariesHookOutput[$hookName]);
    }
    return $this->librariesHookOutput[$hookName];
  }

  function libraryHook(Library $library, $hookName, &$options, $libraryIndex) {
    // Backup previous hook context if defined.
    $hookPrevious = $this->librariesHookCurrent;
    // Save global hook arguments, it allow to use
    // refer() function without to specify for which page / hook.
    $this->librariesHookCurrent = $hookName;
    // Prevent to execute each hook twice for the same library.
    // It can happen on using refer for library dependencies management.
    if (!isset($this->librariesHookQueue[$hookName][$libraryIndex]) && method_exists($library, $hookName)) {
      // Save as passed
      $this->librariesHookQueue[$hookName][$libraryIndex] = TRUE;
      // Execute.
      $this->librariesHookOutput[$hookName][] = $library->$hookName($this, $options);
    }
    // Reset variables.
    $this->librariesHookCurrent = $hookPrevious;
  }

  function push($options = array()) {
    // Send freshly created page instance.
    $options['instance'] = $this;
    if (!isset($options['html'])) {
      $options['html'] = $this->render();
    }
    if ($this->urlAlias) {
      $options['urlAlias'] = $this->urlAlias;
    }
    // Rendering is made during push.
    $this->wjs->extensionPush($this->extensionType, $this->extensionName, $options);
  }

  function websiteRenderHead() {
    return $this->renderHeadTitle() .
    implode($this->librariesHook('renderHeadMeta')) .
    implode($this->librariesHook('renderHeadCss')) .
    implode($this->librariesHook('renderHeadJs'));
  }

  /**
   * Launched by loader on push.
   * Contained into "html" into output data.
   */
  function render($params = array()) {
    // Find template name.
    $this->rendered = $this->renderBody($params);
    return $this->rendered;
  }

  function renderHeadTitle() {
    return '<title>' . $this->title . '</title>';
  }

  function renderJsInclude($path, $inline = '') {
    return $this->wjs->renderJsInclude($path, $inline);
  }

  function renderCssInclude($file) {
    return $this->wjs->renderCssInclude($file);
  }

  function renderBody($params = array()) {
    $html     = $this->loader->htmlLoad($this->extensionName);
    $output   = '';
    $template = $this->serverPath . $this->extensionName . '.tpl.inc';
    if (is_file($template)) {
      $output .= $this->renderTemplate($template, array_merge(array(
        'title' => $this->title,
        'html'  => $html,
        'page'  => $this,
      ), $params));
    }
    else {
      $output .= $html;
    }
    return $this->loader->htmlParse($this->extensionName, $output);
  }

  function renderTemplate($path, $param = array()) {
    // Create global parameters.
    foreach ($param as $var => $val) {
      $$var = $val;
    }
    $website = $this->website;
    // Start buffering.
    ob_start();
    require_once $path;
    $content = ob_get_contents();
    ob_end_clean();
    // Return template content.
    return $content;
  }
}
