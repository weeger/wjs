<?php

namespace Wjs5\Loader\WebPage;

use \Wjs5\Wjs;
use \Wjs5\Website;
use \Wjs5\Loader;
use \Wjs5\ExtensionClass;
use \Wjs5\Loader\WebPage\Extension;
use \Wjs5\Loader\WjsLibrary\Library;

class Page extends ExtensionClass {
  /**
   * @var Website
   */
  var $website;
  /**
   * @var \Wjs5\
   */
  var $w;
  /**
   * @var Extension
   */
  var $extension;
  var $title = 'Page';
  var $libraries = array();
  var $librariesRequired = array();
  var $librariesHookQueue = array();
  var $librariesHookOutput = array();
  var $librariesHookCurrent = '';
  var $rendered;

  function __construct(Extension $extension, $options) {
    $this->extension = $extension;
    $this->w         = $this->extension->w;
    // Link to website (only one page).
    if (isset($options['website'])) {
      $this->website       = isset($options['website']) ? $options['website'] : FALSE;
      $this->website->page = $this;
    }
//    // Search for page alias.
//    $aliases = array_flip($this->website->router);
//    if (isset($aliases[$name])) {
//      $this->urlAlias = $aliases[$name];
//    }
    // Init w as normal library.
    $this->libraryLoad('Wjs', array('w' => $this->w));
    // Load required libraries.
    $this->libraryLoadMultiple($this->librariesRequired);
    $lineage = $this->lineageClassNames();
    // Load associated css / js after requirements.
    foreach ($lineage as $parentExtensionName) {
      if ($parentExtensionName !== $this->extension->extensionName) {
        $extensionParent = $this->w->extensionGet('WebPage', $parentExtensionName);
        if (!($extensionParent instanceof \Wjs5\ExtensionMissing)) {
          // We try tu rebuild parent path,
          // in order to keep symlinks.
          $parentClassPath = $extensionParent->serverPath . $parentExtensionName . '.inc';
          $this->w->extensionsAddLink($parentClassPath, 'css', 'WebPage', $this->extensionName);
          $js = $this->w->extensionsAddLink($parentClassPath, 'js', 'WebPage', $this->extensionName);
          // Add requirement into own w.
          if (is_file($js)) {
            // Import requirements.
            $this->w->jsParseRequire('WebPage', $this->extensionName, file_get_contents($js));
          }
        }
      }
    }
  }

  function lineageClassNames() {
    static $lineage;
    // Only once.
    if (empty($lineage)) {
      // Define location vars.
      $reflector = new \ReflectionClass($this);
      $lineage   = array();
      do {
        $lineage[] = $reflector->getShortName();
      } while ($reflector = $reflector->getParentClass());
      // Revert array to get links in inheritance order.
      $lineage = array_reverse($lineage);
    }
    return $lineage;
  }

  function libraryLoad($name, $options = array()) {
    // Add page to library options.
    $options['page'] = $this;
    // Create library will append it to page libraries.
    $library = $this->w->extensionPush('WjsLibrary', $name, $options);
    // Append to page.
    $this->libraries[] = $library;
    // Return the last library created.
    return $library;
  }

  function libraryLoadMultiple($libraries) {
    // Create list.
    foreach ($libraries as $name => $libraryOptions) {
      if (is_numeric($name)) {
        $name           = $libraryOptions;
        $libraryOptions = array();
      }
      if (!$this->libraryGet($name)) {
        $this->libraryLoadOnce($name, $libraryOptions);
      }
    }
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
   * @return \Wjs5\Loader\WjsLibrary\Library
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
    $options['title'] = $this->title;
    // Rendering is made during push.
    $this->w->extensionPush($this->extensionType, $this->extensionName, $options);
  }

  function websiteRenderHead() {
    return $this->renderHeadTitle() . $this->renderHead() .
    $this->website->htmlFileGetContent('theme/head.html');
  }

  function renderHead() {
    return implode($this->librariesHook('renderHeadMeta')) .
    implode($this->librariesHook('renderHeadCss')) .
    implode($this->librariesHook('renderHeadJs'));
  }

  /**
   * Launched by loader on push.
   * Contained into "html" into output data.
   */
  function render($params = array()) {
    // Find template name.
    return $this->extension->html;
  }

  function renderHeadTitle() {
    return '<title>' . $this->website->optionGet('pageTitle') . $this->title . '</title>';
  }

  function renderJsInclude($path, $inline = '') {
    return $this->w->renderJsInclude($path, $inline);
  }

  function renderCssInclude($file) {
    return $this->w->renderCssInclude($file);
  }

  function renderBody($params = array()) {
    $html     = $this->extension->htmlLoad($this->extensionName);
    $output   = '';
    $template = $this->extension->serverPath . $this->extensionName . '.tpl.inc';
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
    $output .= implode($this->librariesHook('renderBodyFooter'));
    return $output;
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
