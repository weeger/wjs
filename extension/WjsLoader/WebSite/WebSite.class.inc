<?php

namespace Wjs5;

// Find Wjs if not loaded.
require_once (defined('WJS5_ROOT') ? WJS5_ROOT : dirname(__FILE__) . '../../../../php/') . 'w.inc';

use \Wjs5\Loader\WebPage\Page;

/**
 * The website class can be used optionally used with w
 * to manage an advanced site and pages integration.
 * It works with WebPage extensions and expect a specific
 * management, se the demo source code for a live example.
 */
class Website extends Atom {
  /**
   * Name is used into page cache files names.
   * @var string
   */
  var $name = 'website';
  /**
   * Define the environment key name used into htaccess.
   * ex : SetEnv YOUR_SITE_ENV dev
   */
  var $envKey = 'WJS5_ENV';
  /**
   * Define the environment name.
   */
  var $env;
  var $envDefault = FALSE;
  /**
   * Une one instance to load pages.
   * This instance is not exported in client side.
   * Each page has also one specific w instance,
   * with the same extensions available.
   * @var Wjs
   */
  var $wjs;
  /**
   * Save the latest page instance.
   * @var \Wjs5\Loader\WebPage\Page
   */
  var $page;
  var $pageClassType = 'WebPage';
  var $pathAliasQuery = 'q';
  var $websiteInfo = array();
  var $pageSummary = array();
  var $pageAliases = array();
  var $pageLibraries = array();
  var $extensionGlobal = array();
  var $serverPathWebsiteRoot;
  var $serverPathWebsiteRootResolved;

  function __construct($callerFile = '') {
    // Save the raw path to the website root (allow symlinks).
    $this->serverPathWebsiteRoot = dirname($callerFile) . '/';
    // Save resolved path to the website root.
    $this->serverPathWebsiteRootResolved = realpath($this->serverPathWebsiteRoot) . '/';
    // Create default options.
    $settings = array('w' => array());
    // Env key found.
    if ($this->envKey) {
      // Load env.
      $this->env = getenv($this->envKey);
      if (!$this->env) {
        $this->env = $this->envDefault;
      }
      if (!$this->env) {
        print 'No env found for ' . $this->envKey;
        exit;
      }
      // Load env options,
      // it will override $options variable.
      require $this->serverPathWebsiteRootResolved . 'settings/settings.' . $this->env . '.inc';
    }
    // Init router.
    parent::__construct($settings);
    // Append options from environment settings.
    if (is_array($this->optionGet('pageLibraries'))) {
      $this->pageLibraries = array_merge($this->pageLibraries, $this->optionGet('pageLibraries'));
    }
    // Create w instance.
    $this->w = $this->wjsInstance($this->optionGet('w'));
  }

  /**
   * Create a new instance according to
   * given options. Used to instantiate
   * w quickly into website and pages.
   *
   * @param $options
   *
   * @return \Wjs
   */
  function wjsInstance($options = array()) {
    $options['serverPathWebsite'] = $this->serverPathWebsiteRoot;
    $wjs                          = new \Wjs($options);
    // Scan specific extensions.
    // We have to use unresolved symlink
    // to build relative client paths.
    $order                       = array();
    $order[$this->pageClassType] = $this->pageSummary;
    $wjs->scanFolderExtensions($wjs->optionGet('serverPathWebsite') . 'extension/', array(), $order);
    $request = $wjs->optionGet('clientRequest');
    $request = $this->urlToFilename($request ? $request : 'home') . '.js';
    $wjs->optionSet('aggregationFileName', $request);
    return $wjs;
  }

  function urlToFilename($file) {
    // Remove anything which isn't a word, whitespace, number
    // or any of the following caracters -_~,;:[]().
    $file = preg_replace('([^\w\s\d\-_~,;:\[\]\(\).])', '', $file);
    // Remove any runs of periods
    $file = preg_replace('([\.]{2,})', '', $file);
    return $file;
  }

  /**
   * @param $webPageName
   * @param $options
   *
   * @return Page
   */
  function pageInstance($webPageName, $options = array()) {
    /** @var \Wjs5\Loader\WebPage $loader */
    $loader = $this->w->loaderGet($this->pageClassType);
    // Return new page.
    /** @var \Wjs5\Loader\WebPage\Page $page */
    $page = $loader->instance($webPageName, $options, $this->wjsInstance($this->options['w']), $this);
    // Check if exists.
    if (!$page) {
      print 'Not found page ' . $webPageName;
      exit;
    }
    // Add global libraries.
    $page->libraryLoadMultiple($this->pageLibraries);
    // Return instance.
    return $page;
  }

  function renderDefault($webPageName = 'wjsDefault', $params = array()) {
    // Search first for aliases.
    if (isset($_GET[$this->pathAliasQuery]) && isset($this->pageAliases[$_GET[$this->pathAliasQuery]])) {
      $webPageName = $this->pageAliases[$_GET[$this->pathAliasQuery]];
    }
    // Search for query string.
    else if (isset($_GET[$this->pageClassType])) {
      $webPageName = $_GET[$this->pageClassType];
    }
    return $this->render($webPageName, $params);
  }

  function render($webPageName = 'wjsDefault') {
    // Define if we are on an AJAX page or not.
    $ajaxKey = $this->w->optionGet('paramInc');
    $options = array();
    // Query come from an AJAX call.
    if (isset($_GET[$ajaxKey])) {
      // Use page specific w.
      if (isset($_GET[$ajaxKey][$this->pageClassType])) {
        // Create page.
        $this->page = $this->pageInstance($_GET[$ajaxKey][$this->pageClassType]);
        // Push.
        $this->page->push($options);
        // Remove page from query.
        unset($_GET[$ajaxKey][$this->pageClassType]);
        // Use the page w.
        $this->page->w->response($_GET);
      }
      // Or use the global w.
      $this->w->response($_GET);
    }
    // Test is a page is specified as as default
    // webcom arguments like WebPage=MyPage
    if (isset($_GET[$this->pageClassType])) {
      $webPageName = $_GET[$this->pageClassType];
    }
    // Create main page.
    $this->page = $this->pageInstance($webPageName);
    // Add extra libraries.
    $this->pagePreloadInit();
    $options = array_merge(array(
      // Define html body as preloaded.
      'html' => WJS5_PUSH_WEBPAGE_PRELOADED
    ), $options);
    // Push into own w.
    $this->page->push($options);
    $body = $this->renderBody();
    return $this->renderDoctype() . '<html>' .
    $this->renderHead($this->page->websiteRenderHead()) .
    $body .
    '</html>';
  }

  function pagePreloadInit() {
    // Add website root css if present.
    $css = $this->page->w->optionGet('serverPathWebsite') . 'theme/styles.css';
    if (is_file($css)) {
      $this->page->w->import('CssLink', 'theme/styles.css', array(
        'client' => 'theme/styles.css',
        'server' => $css,
      ));
    }
    // Add website root js if present.
    $css = $this->page->w->optionGet('serverPathWebsite') . 'theme/script.js';
    if (is_file($css)) {
      $this->page->w->import('JsLink', 'theme/script.js');
    }
    // Add extra website data.
    $this->websiteInfo = $this->websiteInfoGet();
    $this->page->librariesHook('WebsiteInfo', $this->websiteInfo);
    $this->page->w->import('JsObject', 'WebsiteInfo', $this->websiteInfo);
    $this->page->w->extensionPushRequest($this->extensionGlobal);
  }

  function websiteInfoGet() {
    return array(
      'pageTitle' => $this->optionGet('pageTitle')
    );
  }

  function pageRenderParams() {
    return array();
  }

  /**
   * Scan dir without '.', '..' and hidden files.
   */
  function directoryScanPlainFiles($dir) {
    // Remove all hidden files ("." && "..").
    if (is_dir($dir)) {
      return array_values(preg_grep('/^([^.])/', scandir($dir)));
    }
    return array();
  }

  function htmlFileGetContent($path) {
    $path = $this->page->w->optionGet('serverPathWebsite') . $path;
    if (is_file($path)) {
      return file_get_contents($path);
    }
    return '';
  }

  function renderDoctype() {
    return '<!DOCTYPE html>';
  }

  function renderHead($content) {
    return '<head>' .
    '<meta http-equiv="Content-Type" content="text/html; charset=utf-8">' .
    $content .
    '</head>';
  }

  function renderBody() {
    // Use global template.
    $template     = $this->htmlFileGetContent('theme/page.html');
    $output       = '<body>';
    $output .= '<div id="' . $this->page->extensionName . '-preloaded" style="display:none">' .
      '<div class="html">' . $this->page->render($this->pageRenderParams()) . '</div>' .
      $template .
      '</div>';
    $output .= '</body>';
    // Return final HTML.
    return $output;
  }
}
