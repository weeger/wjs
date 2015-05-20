<?php

namespace Wjs\Loader\WebPage;

class wjsDefault extends Page {
  function renderBody($html, $params = array()) {
    return parent::renderBody($html, $params) .
    '<section>... and also custom php classes overrides</section>';
  }
}
