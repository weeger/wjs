<?php

namespace Wjs\Loader\WjsLibrary;

class Favicon extends Library {
  var $formats = array(
    array('size' => '16x16'),
    array('size' => '32x32'),
    array('size' => '96x96'),
    // Android Chrome
    array('size'   => '192x192',
          'device' => 'android-chrome'),
    // Apple touch
    array('size'   => '57x57',
          'device' => 'apple-touch-icon',
          'rel'    => 'apple-touch-icon'),
    array('size'   => '60x60',
          'device' => 'apple-touch-icon',
          'rel'    => 'apple-touch-icon'),
    array('size'   => '72x72',
          'device' => 'apple-touch-icon',
          'rel'    => 'apple-touch-icon'),
    array('size'   => '76x76',
          'device' => 'apple-touch-icon',
          'rel'    => 'apple-touch-icon'),
    array('size'   => '114x114',
          'device' => 'apple-touch-icon',
          'rel'    => 'apple-touch-icon'),
    array('size'   => '120x120',
          'device' => 'apple-touch-icon',
          'rel'    => 'apple-touch-icon'),
    array('size'   => '120x120',
          'device' => 'apple-touch-icon',
          'rel'    => 'apple-touch-icon'),
    array('size'   => '152x152',
          'device' => 'apple-touch-icon',
          'rel'    => 'apple-touch-icon'),
    array('size'   => '180x180',
          'device' => 'apple-touch-icon',
          'rel'    => 'apple-touch-icon'),
  );
  var $path;

  function init($options = NULL) {
    parent::init($options);
    $this->page = $options['page'];
    $this->path = $options['path'];
  }

  function formatFilePath($format) {
    return $this->path . (isset($format['device']) ? $format['device'] : 'favicon') . '-' . $format['size'] . '.png';
  }

  function renderHeadMeta() {
    $output = '';
    foreach ($this->formats as $format) {
      $faviconFile = $this->formatFilePath($format);
      if (is_file($faviconFile)) {
        $client = $this->page->wjs->pathClient(realpath($faviconFile));
        $output .= '<link rel="' . (isset($format['rel']) ? $format['rel'] : 'icon') . '" sizes="' . $format['size'] . '" href="' . $client . '">';
      }
    }
    return $output;
  }
}
