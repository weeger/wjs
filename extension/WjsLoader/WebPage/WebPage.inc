<?php

namespace Wjs\Loader;

use \Wjs\Loader;

/**
 * @package Wjs\Loader
 */
class WebPage extends WebComp {
  function extensionAdd($name, $data) {
    parent::extensionAdd($name, $data);
    $this->extensions[$name]['urlUpdate'] = TRUE;
  }
}
