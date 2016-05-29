<?php

if (!defined('WJS5_DEBUG_KRUMO_PATH')) {
  // Search into current folder.
  define('WJS5_DEBUG_KRUMO_PATH', realpath(dirname(__FILE__)) . '/krumo/');
}

if (file_exists(WJS5_DEBUG_KRUMO_PATH . 'class.krumo.php')) {
  require_once WJS5_DEBUG_KRUMO_PATH . 'class.krumo.php';
}

// Global debug function.
function d($message, $print = TRUE) {
  if ($print === TRUE) {
    dPrint($message);
  }
  else {
    ob_start();
    dPrint($message);
    $out = ob_get_contents();
    ob_end_clean();
    return $out;
  }
  return '';
}

function trace() {
  d(debug_backtrace());
}

if (!function_exists('dPrint')) {
  function dPrint($message) {
    if (!function_exists('krumo')) {
      echo '<pre style="margin:5px;">';
      print_r($message);
      echo '</pre>';
    }
    else {
      krumo($message);
    }
  }
}

