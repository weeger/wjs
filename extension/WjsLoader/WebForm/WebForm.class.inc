<?php

namespace Wjs5\Loader\WebForm;

class Form {
  /**
   * @var \Wjs5\Extension
   */
  var $extension;
  /**
   * @var \Wjs5\Wjs
   */
  var $w;
  var $formId;
  var $formStamp;

  function __construct($extension) {
    $this->extension = $extension;
    $this->w         = $this->extension->w;
  }

  function submit($post) {
    return TRUE;
  }
}
