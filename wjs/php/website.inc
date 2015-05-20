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
    $wjs->scanFolderExtensions($wjs->optionGet('serverPathWebsite') . 'extension/');
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
    return $loader->instance($webPageName, $options, $this->wjsInstance($this->options['wjs']), $this);
  }

  function renderDefault($webPageName = 'wjsDefault', $params = array()) {
    if (isset($_GET[$this->pageClassType])) {
      $webPageName = $_GET[$this->pageClassType];
    }
    return $this->render($webPageName, $params);
  }

  function render($webPageName = 'wjsDefault', $params = array()) {

    // Define if we are on an AJAX page or not.
    $ajaxKey = $this->wjs->optionGet('paramInc');

    if (isset($_GET[$ajaxKey])) {
      // Use page specific wjs.
      if (isset($_GET[$ajaxKey][$this->pageClassType])) {
        $this->page = $this->pageInstance($_GET[$ajaxKey][$this->pageClassType]);
        $this->renderPage($_GET[$ajaxKey][$this->pageClassType], $params);
        unset($_GET[$ajaxKey][$this->pageClassType]);
        // Use the page wjs.
        $this->page->wjs->response($_GET);
      }
      // Or use the global wjs.
      $this->wjs->response($_GET);
    }

    $this->page = $this->pageInstance($webPageName);
    $this->renderPage($webPageName, $params);
    if (!$this->page) {
      return 'Not found page ' . $webPageName;
    }

    $content  = '<div id="wjs-preloaded-' . $this->pageClassType . '-' . $webPageName . '">' . '</div>';
    $template = $this->page->wjs->optionGet('serverPathWebsite') . 'theme/page.html';
    if (is_file($template)) {
      $content = str_replace('{{content}}', $content, file_get_contents($template));
    }

    return $this->renderDoctype() . '<html>' .
    $this->renderHead($this->page->websiteRenderHead()) .
    $this->renderBody($content) .
    '</html>';
  }

  function renderPage($webPageName, $params = array()) {
    if ($this->wjs->extensionGet($this->pageClassType, $webPageName)) {
      // Add website root css if present.
      $css = $this->page->wjs->optionGet('serverPathWebsite') . 'theme/styles.css';
      if (is_file($css)) {
        $this->page->wjs->import('CssLink', 'theme/styles.css', array(
          'client' => 'theme/styles.css',
          'server' => $css,
        ));
      }
      // Add website root js if present.
      $css = $this->page->wjs->optionGet('serverPathWebsite') . 'theme/script.js';
      if (is_file($css)) {
        $this->page->wjs->import('JsLink', 'theme/script.js');
      }
      // Push page.
      $this->page->push(array(
        // Enable url update on page changes
        'urlHistory' => TRUE,
        // Preload only for non AJAX pages.
        'preloaded'  => !isset($_GET[$this->wjs->optionGet('paramInc')]),
        // Parameters used into template rendering.
        'params'     => $params
      ));
      // Add extra website data.
      $this->page->librariesHook('WebsiteInfo', $this->websiteInfo);
      $this->page->wjs->import('JsObject', 'WebsiteInfo', $this->websiteInfo);
    }
    return $this->page;
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

  function renderBody($content) {
    return '<body>' .
    $content .
    '</body>';
  }

}
