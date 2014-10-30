<?php

namespace Wjs;

class WjsCoreSummary extends Summary {
  var $loaders = array(
    'jsScript'  => '../loader/jsScript/',
    'wjsLoader' => '../loader/wjsLoader/',
  );
  var $extensions = array(
    // Add extra core loaders.
    'wjsLoader' => array(
      'jsObject' => '../loader/jsObject/',
      'jsLink'   => '../loader/jsLink/',
      'cssLink'  => '../loader/cssLink/',
      'jsMethod' => '../loader/jsMethod/',
      'jsArray'  => '../loader/jsArray/',
      'image'    => '../loader/image/',
    )
  );
}