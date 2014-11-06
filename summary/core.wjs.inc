<?php

namespace Wjs;

class WjsCoreSummary extends Summary {
  /**
   * Contains default arguments for WjsLoaders,
   * These arguments are rewrite by wjs to adjust it
   * according wjs subversion, and global path.
   * @var array
   */
  var $extensions = array(
    // Add extra core loaders.
    'WjsLoader' => array(
      'WjsLoader' => array(
        'server' => array(
          'class' => 'loader/WjsLoader/WjsLoader.inc',
          'js'    => 'loader/WjsLoader/WjsLoader.min.min.js'
        ),
        'client' => array(
          'js' => 'loader/WjsLoader/WjsLoader.min.js'
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
          'js'    => 'loader/JsScript/JsScript.min.js',
        ),
        'client' => array(
          'js' => 'loader/JsScript/JsScript.min.js',
        )
      ),
      'JsLink'    => array(
        'server' => array(
          'class' => 'loader/JsLink/JsLink.inc',
          'js'    => 'loader/JsLink/JsLink.min.js',
        ),
        'client' => array(
          'js' => 'loader/JsLink/JsLink.min.js',
        ),
      ),
      'CssLink'   => array(
        'server' => array(
          'class' => 'loader/CssLink/CssLink.inc',
          'js'    => 'loader/CssLink/CssLink.min.js',
        ),
        'client' => array(
          'js' => 'loader/CssLink/CssLink.min.js',
        )
      ),
      'JsMethod'  => array(
        'server' => array(
          'class' => 'loader/JsMethod/JsMethod.inc',
          'js'    => 'loader/JsMethod/JsMethod.min.js',
        ),
        'client' => array(
          'js' => 'loader/JsMethod/JsMethod.min.js',
        )
      ),
      'Image'     => array(
        'server' => array(
          'class' => 'loader/Image/Image.inc',
          'js'    => 'loader/Image/Image.min.js',
        ),
        'client' => array(
          'js' => 'loader/Image/Image.min.js',
        )
      ),
    )
  );
}