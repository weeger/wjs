<?php

$wjsClientPath =
$wjsServerPath = '../dev/';

require_once $wjsServerPath . 'wjs.inc';

// Create a WJS instance,
// used for both page load and AJAX response.
$wjs = new \Wjs(array(
  'server' => array(
    'wjs'        => $wjsServerPath,
    'cacheDir'   => 'cache/',
    // Add a token to be sure wjs uses the last version cache,
    // changes it on new site version submission
    'cacheToken' => '[CACHE_TOKEN]',
//    'jsCoreFilesVersion' => 'source'
  ),
  'client' => array(
    'wjs'      => $wjsClientPath,
    'cacheDir' => 'cache/'
  )
));

// Define a custom loader for our site pages.
$wjs->define('DemoPage', array(
  'server' => array(
    'class' => 'loader/DemoPage/DemoPage.inc',
    'js'    => 'loader/DemoPage/DemoPage.js'
  ),
  'client' => array(
    'js' => 'loader/DemoPage/DemoPage.js'
  )
));

// Each component have a .json file into its folder.
// It contains required and optional information used
// by loaders and internal page management. These files
// also contains extensions dependencies.

// Add web components.
/** @var $loaderWebComp \Wjs\Loader\WebComp */
$loaderWebComp = $wjs->loaderGet('WebComp');
$loaderWebComp->scanFolder('extensions/WebComp/');

// Add pages.
/** @var $loaderDemoPage \Wjs\Loader\DemoPage */
$loaderDemoPage = $wjs->loaderGet('DemoPage');
$loaderDemoPage->scanFolder('extensions/DemoPage/', array(), array(
  'Home',
  'Presentation',
  'Overview',
  'Navigation',
  'Download',
  'Thanks',
));

// We are on an AJAX request.
if (isset($_GET['wjs'])) {
  // This function will run an exit;
  $wjs->response($_GET);
}

// Add lazy loader detector.
$wjs->import('JsClassStatic', 'wjsHref');
// Load home page if no page specified into URL.
$wjs->import('DemoPage', isset($_GET['DemoPage']) ? current($_GET['DemoPage']) : 'Home');