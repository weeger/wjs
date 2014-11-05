<?php

namespace Wjs;

class WjsCoreSummary extends Summary {

  var $extensions = array(
    // Add extra core loaders.
    'WjsLoader' => array(
      'WjsLoader' => array(
        'server' => array(
          'class' => 'loader/WjsLoader/WjsLoader.inc',
          'js'    => 'loader/WjsLoader/WjsLoader.js'
        ),
        'client' => array(
          'js' => 'loader/WjsLoader/WjsLoader.js'
        )
      ),
      'JsObject'  => array(
        'server' => array(
          'class' => 'loader/JsObject/JsObject.inc'
        )
      ),
      'JsArray'   => array(
        'server' => array(
          'class' => 'loader/JsArray/JsArray.inc'
        )
      ),
      'JsScript'  => array(
        'server' => array(
          'class' => 'loader/JsScript/JsScript.inc',
          'js'    => 'loader/JsScript/JsScript.js',
        ),
        'client' => array(
          'js' => 'loader/JsScript/JsScript.js',
        )
      ),
      'JsLink'    => array(
        'server' => array(
          'class' => 'loader/JsLink/JsLink.inc',
          'js'    => 'loader/JsLink/JsLink.js',
        ),
        'client' => array(
          'js' => 'loader/JsLink/JsLink.js',
        ),
      ),
      'CssLink'   => array(
        'server' => array(
          'class' => 'loader/CssLink/CssLink.inc',
          'js'    => 'loader/CssLink/CssLink.js',
        ),
        'client' => array(
          'js' => 'loader/CssLink/CssLink.js',
        )
      ),
      'JsMethod'  => array(
        'server' => array(
          'class' => 'loader/JsMethod/JsMethod.inc',
          'js'    => 'loader/JsMethod/JsMethod.js',
        ),
        'client' => array(
          'js' => 'loader/JsMethod/JsMethod.js',
        )
      ),
      'Image'     => array(
        'server' => array(
          'class' => 'loader/Image/Image.inc',
          'js'    => 'loader/Image/Image.js',
        ),
        'client' => array(
          'js' => 'loader/Image/Image.js',
        )
      ),
    )
  );
}