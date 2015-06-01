<?php

namespace Wjs;

require_once 'wjs.inc';
require_once 'router.inc';

use \Wjs;
use \Wjs\Loader\WebPage\Page;

/**
 * The website class can be used optionally used with wjs
 * to manage an advanced site and pages integration.
 * It works with WebPage extensions and expect a specific
 * management, se the demo source code for a live example.
 */
class Website extends Router {
  /**
   * Name is used into page cache files names.
   * @var string
   */
  var $name = 'website';
  /**
   * Define the environment key name used into htaccess.
   * ex : SetEnv YOUR_SITE_ENV dev
   */
  var $envKey = 'WJS_ENV';
  /**
   * Define the environment name.
   */
  var $env;
  /**
   * Une one instance to load pages.
   * This instance is not exported in client side.
   * Each page has also one specific wjs instance,
   * with the same extensions available.
   * @var Wjs
   */
  var $wjs;
  /**
   * Save the latest page instance.
   * @var \Wjs\Loader\WebPage\Page
   */
  var $page;
  var $pageClassType = 'WebPage';
  var $websiteInfo = array();
  var $pageSummary = array();
  var $pageAliases = array();
  var $extensionGlobal = array();

  function __construct($callerFile = '') {
    // Save the raw path to the website root (allow symlinks).
    $this->serverPathWebsiteRoot = dirname($callerFile) . '/';
    // Save resolved path to the website root.
    $this->serverPathWebsiteRootResolved = realpath($this->serverPathWebsiteRoot) . '/';
    // Create default options.
    $settings = array('wjs' => array());
    // Env key found.
    if ($this->envKey) {
      // Load env.
      $this->env = getenv($this->envKey);
      if ($this->env === FALSE) {
        print 'No env found for ' . $this->envKey;
        exit;
      }
      // Load env options,
      // it will override $options variable.
      require $this->serverPathWebsiteRootResolved . 'settings/settings.' . $this->env . '.inc';
    }
    // Init router.
    parent::__construct($settings);
    // Create wjs instance.
    $this->wjs = $this->wjsInstance($this->optionGet('wjs'));
  }

  /**
   * Create a new instance according to
   * given options. Used to instantiate
   * wjs quickly into website and pages.
   *
   * @param $options
   *
   * @return \Wjs
   */
  function wjsInstance($options = array()) {
    $options['serverPathWebsite'] = $this->serverPathWebsiteRoot;
    $wjs                          = new Wjs($options);
    // Scan specific extensions.
    // We have to use unresolved symlink
    // to build relative client paths.
    $order                       = array();
    $order[$this->pageClassType] = $this->pageSummary;
    $wjs->scanFolderExtensions($wjs->optionGet('serverPathWebsite') . 'extension/', array(), $order);
    return $wjs;
  }

  /**
   * @param $webPageName
   * @param $options
   *
   * @return Page
   */
  function pageInstance($webPageName, $options = array()) {
    /** @var \Wjs\Loader\WebPage $loader */
    $loader = $this->wjs->loaderGet($this->pageClassType);
    // Return new page
    $page = $loader->instance($webPageName, $options, $this->wjsInstance($this->options['wjs']), $this);
    $aliases = array_flip($this->pageAliases);
    if (isset($aliases[$webPageName])) {
      $page->urlAlias = $aliases[$webPageName];
    }
    // Check if exists.
    if (!$page) {
      print 'Not found page ' . $webPageName;
      exit;
    }
    return $page;
  }

  function renderDefault($webPageName = 'wjsDefault', $params = array()) {
    if (isset($_GET[$this->pageClassType])) {
      $webPageName = $_GET[$this->pageClassType];
    }
    // Search for aliases.
    elseif (isset($_GET['q']) && isset($this->pageAliases[$_GET['q']])) {
      $webPageName = $this->pageAliases[$_GET['q']];
    }
    return $this->render($webPageName, $params);
  }

  function render($webPageName = 'wjsDefault') {
    // Define if we are on an AJAX page or not.
    $ajaxKey = $this->wjs->optionGet('paramInc');
    $options = array();
    // Query come from an AJAX call.
    if (isset($_GET[$ajaxKey])) {
      // Use page specific wjs.
      if (isset($_GET[$ajaxKey][$this->pageClassType])) {
        // Create page.
        $this->page = $this->pageInstance($_GET[$ajaxKey][$this->pageClassType]);
        // Push.
        $this->page->push($options);
        // Remove page from query.
        unset($_GET[$ajaxKey][$this->pageClassType]);
        // Use the page wjs.
        $this->page->wjs->response($_GET);
      }
      // Or use the global wjs.
      $this->wjs->response($_GET);
    }
    // Create main page.
    $this->page = $this->pageInstance($webPageName);
    // Add extra libraries.
    $this->pagePreloadInit();
    $options = array_merge(array(
      // Enable url update on page changes
      'urlHistory' => TRUE,
      // Define html body as preloaded.
      'html'       => WJS_PUSH_WEBPAGE_PRELOADED
    ), $options);
    // Push into own wjs.
    $this->page->push($options);
    return $this->renderDoctype() . '<html>' .
    $this->renderHead($this->page->websiteRenderHead()) .
    $this->renderBody() .
    '</html>';
  }

  function pagePreloadInit() {
    // Add extra website data.
    $this->page->librariesHook('WebsiteInfo', $this->websiteInfo);
    $this->page->wjs->import('JsObject', 'WebsiteInfo', $this->websiteInfo);
    $this->page->wjs->extensionPushRequest($this->extensionGlobal);
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
    $output = '<body>';
    $output .= '<div id="' . $this->page->extensionName . '-preloaded">' .
      '<div class="html">' .
      $this->page->render($this->pageRenderParams()) .
      '</div>' .
      '</div>';
    $output .= '<body>';
    return $output;
  }
}
