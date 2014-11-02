<?php

namespace Wjs;

class WjsCoreSummary extends Summary {

  var $extensions = array(
    // Add extra core loaders.
    'WjsLoader' => array(
      'JsObject' => array(
        'loader/JsObject/JsObject.inc',
        'loader/JsObject/JsObject.js'
      ),
      'JsScript' => array(
        'loader/JsScript/JsScript.inc',
        'loader/JsScript/JsScript.js'
      ),
      'CssLink'  => array(
        'loader/CssLink/CssLink.inc',
        'loader/CssLink/CssLink.js'
      ),
      'JsMethod' => array(
        'loader/JsMethod/JsMethod.inc',
        'loader/JsMethod/JsMethod.js'
      ),
      'JsArray'  => array(
        'loader/JsArray/JsArray.inc',
        'loader/JsArray/JsArray.js'
      ),
      'Image'    => array(
        'loader/Image/Image.inc',
        'loader/Image/Image.js'
      ),
    )
  );
}