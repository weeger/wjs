<?php

require_once 'wjs/php/website.inc';

use Wjs\Website;
use Wjs\Page;

class DemoWebsite extends Website {
  var $pageClassType = 'DemoPage';
  var $pageSummary = array(
    'Home',
    'WebComp'
  );

  function pageInstance($webPageName, $options = array()) {
    $page = parent::pageInstance($webPageName, $options = array());
    $page->libraryLoad('WjsDebug');
    return $page;
  }

  function pagePreloadInit() {
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
    parent::pagePreloadInit();
  }

  function renderBody() {
    $content  = parent::renderBody();
    $template = $this->page->wjs->optionGet('serverPathWebsite') . 'theme/page.html';
    $content  = str_replace('{{content}}', $content, file_get_contents($template));
    return $content;
  }
}
