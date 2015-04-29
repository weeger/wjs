<?php

define('WJS_DEMO_SITE_ROOT', dirname(__FILE__) . '/');
define('WJS_ROOT', WJS_DEMO_SITE_ROOT . 'wjs/');
require_once WJS_ROOT . 'php/wjs.inc';

// Load home page if no page specified into URL.
$page = 'Home';
if (isset($_GET['DemoPage'])) {
  // DemoPage is an array, get first item.
  $page = current($_GET['DemoPage']);
}

// Create a WJS instance,
// used for both page load and AJAX response.
$wjs = new Wjs(array(
  // Turn on this option to use core source files.
  // 'jsCoreFilesVersion' => 'source'
  'aggregationEnabled' => TRUE,
  // Define cache folder.
  'serverPathCache'     => WJS_DEMO_SITE_ROOT . 'cache/',
  // Add token into aggregated files
  'cacheToken'         => '-' . $page . '-' . date('Y-m-d')
));

// Add all extensions.
$wjs->scanFolderExtensions('extensions/', array(), array(
  'DemoPage' => array(
    'Home',
    'Presentation',
    'Overview',
    'Navigation',
    'Download',
    'Thanks',
  )
));

// If we are on an AJAX request.
if (isset($_GET['wjs'])) {
  // This function will print requested data
  // and run an exit; process will terminate.
  $wjs->response($_GET);
}



$wjs->import('DemoPage', $page);