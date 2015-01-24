<?php

namespace Wjs;

class WjsCoreSummary extends Summary {
  function add(\Wjs $wjs) {
    // Add core loaders.
    $WjsLoaderData = array(
      'server' => array(
        'class' => $wjs->routeGet('server', 'wjs')  . 'extension/WjsLoader/WjsLoader/WjsLoader.inc',
        'js'    => $wjs->routeGet('server', 'wjs')  . 'extension/WjsLoader/WjsLoader/WjsLoader.min.js'
      ),
      'client' => array(
        'js' => $wjs->routeGet('client', 'wjs')  .  'extension/WjsLoader/WjsLoader/WjsLoader.min.js'
      )
    );
    $wjs->loaders['WjsLoader']                          = new \Wjs\Loader\WjsLoader($WjsLoaderData, $wjs);
    $wjs->loaders['WjsLoader']->extensions['WjsLoader'] = $WjsLoaderData;
    // Scan extensions
    $wjs->scanFolderExtensions(dirname(__FILE__) . '/../extension/', array(), array(
      'WjsLoader' => array(
        'WjsLoader',
        'JsLink',
        'JsScript',
        'JsMethod',
      )
    ));
  }
}