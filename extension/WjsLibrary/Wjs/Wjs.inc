<?php

namespace Wjs\Loader\WjsLibrary;

use \Wjs\Loader\WebPage\Page;

class Wjs extends Library {

  function renderHeadJs(Page $page) {
    return $page->wjs->renderHeader();
  }
}
