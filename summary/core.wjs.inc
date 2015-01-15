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
    'WjsLoader'     => array(
      'WjsLoader'     => array(
        'server' => array(
          'class' => 'loader/WjsLoader/WjsLoader.inc',
          'js'    => 'loader/WjsLoader/WjsLoader.min.js'
        ),
        'client' => array(
          'js' => 'loader/WjsLoader/WjsLoader.min.js'
        )
      ),
      'JsObject'      => array(
        'server' => array(
          'class' => 'loader/JsObject/JsObject.inc'
        )
      ),
      'JsArray'       => array(
        'server' => array(
          'class' => 'loader/JsArray/JsArray.inc'
        )
      ),
      'Group'         => array(
        'server' => array(
          'class' => 'loader/Group/Group.inc',
        ),
      ),
      'JsScript'      => array(
        'server' => array(
          'class' => 'loader/JsScript/JsScript.inc',
          'js'    => 'loader/JsScript/JsScript.min.js',
        ),
        'client' => array(
          'js' => 'loader/JsScript/JsScript.min.js',
        )
      ),
      'JsLink'        => array(
        'server' => array(
          'class' => 'loader/JsLink/JsLink.inc',
          'js'    => 'loader/JsLink/JsLink.min.js',
        ),
        'client' => array(
          'js' => 'loader/JsLink/JsLink.min.js',
        ),
      ),
      'CacheLink'     => array(
        'server' => array(
          'class' => 'loader/CacheLink/CacheLink.inc',
          'js'    => 'loader/CacheLink/CacheLink.min.js',
        ),
        'client' => array(
          'js' => 'loader/CacheLink/CacheLink.min.js',
        ),
      ),
      'CssLink'       => array(
        'server' => array(
          'class' => 'loader/CssLink/CssLink.inc',
          'js'    => 'loader/CssLink/CssLink.min.js',
        ),
        'client' => array(
          'js' => 'loader/CssLink/CssLink.min.js',
        )
      ),
      'JsMethod'      => array(
        'server' => array(
          'class' => 'loader/JsMethod/JsMethod.inc',
          'js'    => 'loader/JsMethod/JsMethod.min.js',
        ),
        'client' => array(
          'js' => 'loader/JsMethod/JsMethod.min.js',
        )
      ),
      'JsClass'       => array(
        'server' => array(
          'class' => 'loader/JsClass/JsClass.inc',
          'js'    => 'loader/JsClass/JsClass.min.js',
        ),
        'client' => array(
          'js' => 'loader/JsClass/JsClass.min.js',
        )
      ),
      'JsClassStatic' => array(
        'server' => array(
          'class' => 'loader/JsClassStatic/JsClassStatic.inc',
          'js'    => 'loader/JsClassStatic/JsClassStatic.min.js',
        ),
        'client' => array(
          'js' => 'loader/JsClassStatic/JsClassStatic.min.js',
        )
      ),
      'Image'         => array(
        'server' => array(
          'class' => 'loader/Image/Image.inc',
          'js'    => 'loader/Image/Image.min.js',
        ),
        'client' => array(
          'js' => 'loader/Image/Image.min.js',
        )
      ),
      'WebComp'       => array(
        'server' => array(
          'class' => 'loader/WebComp/WebComp.inc',
          'js'    => 'loader/WebComp/WebComp.min.js',
        ),
        'client' => array(
          'js' => 'loader/WebComp/WebComp.min.js',
        )
      ),
      'WebPage'       => array(
        'server' => array(
          'class' => 'loader/WebPage/WebPage.inc',
          'js'    => 'loader/WebPage/WebPage.min.js',
        ),
        'client' => array(
          'js' => 'loader/WebPage/WebPage.min.js',
        )
      ),
    ),
    'JsClassStatic' => array(
      'lazyTagsLoad' => 'extension/JsClassStatic/lazyTagsLoad.min.js',
    ),
    'JsMethod'      => array(
      'cssListAnimationDelay' => 'extension/JsMethod/cssListAnimationDelay.min.js',
      'cssVendorPrefix'       => 'extension/JsMethod/cssVendorPrefix.min.js',
      'eventKeyCode'          => 'extension/JsMethod/eventKeyCode.min.js',
      'eventTransitionName'   => 'extension/JsMethod/eventTransitionName.min.js',
      'isDomNode'             => 'extension/JsMethod/isDomNode.min.js',
      'staticClass'           => 'extension/JsMethod/staticClass.min.js',
      'objectToArray'         => 'extension/JsMethod/objectToArray.min.js',
      'urlQueryParse'         => 'extension/JsMethod/urlQueryParse.min.js',
      'urlQueryBuild'         => 'extension/JsMethod/urlQueryBuild.min.js',
    )
  );
}