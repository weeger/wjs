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
  var $name = 'Wjs default website';
  var $serverPathWebsiteRoot;
  var $serverPathWebsiteRootResolved;
  var $router = array();
  /**
   * Une one instance to load pages.
   * This instance is not exported in client side.
   * Each page has also one specific w instance,
   * with the same extensions available.
   * @var Wjs
   */
  var $w;
  /**
   * Save the latest page instance.
   * @var \Wjs5\Loader\WebPage\Page
   */
  var $page;
  var $pageClassType = 'WebPage';
  var $pathAliasQuery = 'q';
  var $globalLibraries = array();

  function __construct($callerFile = '') {
    // Save the raw path to the website root (allow symlinks).
    $this->serverPathWebsiteRoot = dirname($callerFile) . '/';
    // Save resolved path to the website root.
    $this->serverPathWebsiteRootResolved = realpath($this->serverPathWebsiteRoot) . '/';
    // Search for a local router.
    // It may be replaced as an external library.
    $routerJson   = $this->serverPathWebsiteRootResolved . 'router.json';
    $this->router = file_exists($routerJson) ? json_decode(file_get_contents($routerJson), JSON_OBJECT_AS_ARRAY) : $this->router;
    // Create default options.
    $settings = array('w' => array());
    // Init options.
    parent::__construct($settings);
    // Append options from environment settings.
    if (is_array($this->optionGet('globalLibraries'))) {
      // Contains list of global libraries.
      $this->globalLibraries = array_merge($this->globalLibraries, $this->optionGet('globalLibraries'));
    }
    // Create w instance.
    $this->w = $this->wInstance();
    // TODO temp
    $this->w->extensionPush('WjsLibrary', 'WjsDebug');
    $this->w->subversion = 'source';
  }

  /**
   * Create a new instance according to
   * given options. Used to instantiate
   * w quickly into website and pages.
   *
   * @param array $options
   *
   * @return Wjs
   */
  function wInstance($options = array()) {
    // Merge options with defaults.
    $options = array_merge($this->optionGet('w'), $options);
    // Adjust website path.
    $options['serverPathWebsite'] = $this->serverPathWebsiteRoot;
    // Build instance.
    $w = new Wjs($options);
    // Scanning specific extensions need to respect pages order.
    $order = array();
    // We may use a subclass of WebPage.
    $order[$this->pageClassType] = $this->routerGetPages();
    // We have to use unresolved symlink
    // to build relative client paths.
    $w->scanFolderExtensions($w->optionGet('serverPathWebsite') . 'extension/', array(), $order);
    // Get the requested page.
    $request = $w->optionGet('clientRequest');
    // Build a filename in case of aggregation is enabled.
    $w->optionSet('aggregationFileName', $this->urlToFilename($request ? $request : 'home') . '.js');
    // Return instance.
    return $w;
  }

  /**
   * Return all pages class names from router.
   * It may be rewritten when router will be replaced by a separated library.
   */
  function routerGetPages() {
    return array_values($this->router);
  }

  /**
   * Convert an URL string to a filename.
   *
   * @param string $file
   *
   * @return string
   */
  function urlToFilename($file) {
    // Remove anything which isn't a word, whitespace, number
    // or any of the following characters -_~,;:[]().
    $file = preg_replace('([^\w\s\d\-_~,;:\[\]\(\).])', '', $file);
    // Remove any runs of periods
    return preg_replace('([\.]{2,})', '', $file);
  }

  function renderDefault($webPageName = 'wjsDefault') {
    // Search first for aliases.
    if (isset($_GET[$this->pathAliasQuery]) && isset($this->router[$_GET[$this->pathAliasQuery]])) {
      $webPageName = $this->router[$_GET[$this->pathAliasQuery]];
    }
    // Search for query string.
    else if (isset($_GET[$this->pageClassType])) {
      $webPageName = $_GET[$this->pageClassType];
    }
    return $this->render($webPageName);
  }

  function render($webPageName = 'wjsDefault') {
    // Define if we are on an AJAX page or not.
    $ajaxKey = $this->w->optionGet('paramInc');
    $options = array();
    // Query come from an AJAX call.
    if (isset($_GET[$ajaxKey])) {
      // Use page specific w.
//      if (isset($_GET[$ajaxKey][$this->pageClassType])) {
//        // Create page.
//        $this->page = $this->pageInstance($_GET[$ajaxKey][$this->pageClassType]);
//        // Push.
//        $this->page->push($options);
//        // Remove page from query.
//        unset($_GET[$ajaxKey][$this->pageClassType]);
//        // Use the page w.
//        $this->page->w->response($_GET);
//      }
      // Or use the global w.
      $this->w->response($_GET);
    }
//    // Test is a page is specified as as default
//    // webcom arguments like WebPage=MyPage
//    if (isset($_GET[$this->pageClassType])) {
//      $webPageName = $_GET[$this->pageClassType];
//    }
//    // Create main page.
//    $this->page = $this->pageInstance($webPageName);
//    // Add extra libraries.
//    $this->pagePreloadInit();
//    $options = array_merge(array(
//      // Define html body as preloaded.
//      'html' => WJS_PUSH_WEBPAGE_PRELOADED
//    ), $options);
//    // Push into own w.
    // Page has appended itself to website.
    $this->w->extensionPush($this->pageClassType, $webPageName, array(
      // Define html body as preloaded.
      'html'      => WJS5_PUSH_WEBPAGE_PRELOADED,
      // The page will attach itself to this.
      'website'   => $this,
      // Add global libraries.
      'libraries' => $this->globalLibraries
    ));
    // Render body before head.
    $body = $this->renderBody();
    // Return html content.
    return $this->renderDoctype() . '<html>' .
    $this->renderHead() .
    $body .
    '</html>';
  }

  function pageRenderParams() {
    // TODO Why ??
    return array();
  }


  function htmlFileGetContent($path) {
    // Get the site root path.
    $path = $this->w->optionGet('serverPathWebsite') . $path;
    // File may not exist.
    return is_file($path) ? file_get_contents($path) : '';
  }

  function renderDoctype() {
    return '<!DOCTYPE html>';
  }

  function renderHead() {
    return '<head>' .
    '<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />' .
    '<meta name="generator" content="WJS ' . WJS5_VERSION . '-' . $this->w->subversion . '" />' .
    $this->page->websiteRenderHead() .
    '</head>';
  }

  function renderBody() {
    // Use global template.
    $template = $this->htmlFileGetContent('theme/page.html');
    $output   = '<body>';
    $output .= '<div id="' . $this->page->extension->extensionName . '-preloaded" style="display:none">' .
      '<div class="html">' . $this->page->render($this->pageRenderParams()) . '</div>' .
      $template .
      '</div>';
    $output .= '</body>';
    // Return final HTML.
    return $output;
  }
}
