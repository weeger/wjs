<?php

namespace Wjs5\PhpMethod;

function drupalConnect($drupal_root, $drupal_base_url, $callbacks = array()) {
  static $connected = FALSE;
  if (!$connected) {
    $connected = TRUE;
    global $base_url;
    // Override Drupal base url.
    $base_url = $drupal_base_url;
    // Save to reset after connection.
    $cwd = getcwd();
    // Change current root.
    chdir($drupal_root);
    // Define manually global var.
    define('DRUPAL_ROOT', getcwd());
    // Fix : some time geoPHP is not loaded correctly.
    if (isset($callbacks['before'])) {
      $callbacks['before']();
    }
    // Load Drupal.
    require_once $drupal_root . '/includes/bootstrap.inc';
    // Here we go !
    drupal_bootstrap(DRUPAL_BOOTSTRAP_FULL);
    // Clear geoPHP file.
    $geoPhp = DRUPAL_ROOT . '/sites/all/modules/geophp/geoPHP/geoPHP.inc';
    // Fix : some time geoPHP is not loaded correctly.
    if (is_file($geoPhp)) {
      require_once $geoPhp;
    }
    // Handle bugs from identified modules.
    if (module_exists('gmap')) {
      // Missing include.
      include_once drupal_get_path('module', 'gmap') . '/lib/Drupal/gmap/GmapDefaults.php';
    }
    // Reset working directory.
    chdir($cwd);
  }
}
