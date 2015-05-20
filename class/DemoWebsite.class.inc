<?php

require_once 'wjs/php/website.inc';

use Wjs\Website;
use Wjs\Page;

class DemoWebsite extends Website {
  var $pageClassType = 'DemoPage';

  function pageInstance($webPageName, $options = array()) {
    $page = parent::pageInstance($webPageName, $options = array());
    $page->libraryLoad('WjsDebug');
    return $page;
  }
}
