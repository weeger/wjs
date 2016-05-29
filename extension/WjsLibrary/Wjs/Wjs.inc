<?php

namespace Wjs5\Loader\WjsLibrary;

use \Wjs5\Loader\WebPage\Page;

class Wjs extends Library {
  function renderHeadJs(Page $page) {
    return $page->w->renderHeader();
  }
}
