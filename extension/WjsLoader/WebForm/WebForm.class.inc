<?php

namespace Wjs5\Loader\WebForm;

class Form {
  var $type;
  var $name;
  /**
   * @var \Wjs
   */
  var $wjs;
  var $formId;
  var $formStamp;

  function __construct($type, $name, $data, $wjs) {
    $this->type = $type;
    $this->name = $name;
    foreach ($data as $key => $value) {
      $this->$key = $value;
    }
    $this->wjs = $wjs;
  }

  function submitCall($post) {
    // Here will be executed default form verifications.
    return $this->submit($post);
  }

  function submit($post) {
    return TRUE;
  }
}
