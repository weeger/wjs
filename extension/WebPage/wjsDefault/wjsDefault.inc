<?php

namespace Wjs\Loader\WebPage;

class wjsDefault extends Page {
  function renderBody($params = array()) {
    return parent::renderBody($params) .
    '<section>... and also custom php classes overrides</section>';
  }
}
