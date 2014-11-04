<?php

namespace Wjs;

class WjsCoreSummary extends Summary {

  var $extensions = array(
    // Add extra core loaders.
    'WjsLoader' => array(
      'JsObject' => array(
        'loader/JsObject/JsObject.inc'
      ),
      'JsArray'  => array(
        'loader/JsArray/JsArray.inc'
      ),
      'JsScript' => array(
        'loader/JsScript/JsScript.inc',
        'loader/JsScript/JsScript.js'
      ),
      'JsLink'   => array(
        'loader/JsLink/JsLink.inc',
        'loader/JsLink/JsLink.js'
      ),
      'CssLink'  => array(
        'loader/CssLink/CssLink.inc',
        'loader/CssLink/CssLink.js'
      ),
      'JsMethod' => array(
        'loader/JsMethod/JsMethod.inc',
      'loader/JsMethod/JsMethod.js'
      ),
      'Image'    => array(
        'loader/Image/Image.inc',
        'loader/Image/Image.js'
      ),
    )
  );
}