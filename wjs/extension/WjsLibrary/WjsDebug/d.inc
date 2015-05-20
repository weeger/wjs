<?php

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