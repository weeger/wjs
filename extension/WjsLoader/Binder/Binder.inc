<?php

namespace Wjs\Loader;

require_once WJS_ROOT . 'extension/WjsLoader/WebCom/WebCom.inc';

class Binder extends WebCom {
  // Do not use WebCom css links detection.
  var $requireCssLinks = FALSE;
  function extensionPush($name, $excludeRequire = array(), $value = NULL) {
    // Get values.
    $value  = $this->valuePush($name, $value);
    // Push as a webcom.
    $output = parent::extensionPush($name, $excludeRequire, $value);
    if (!$this->valueIsError($value)) {
      // CSS for binders is not a link, but is loaded and parsed.
      $pathCss = $this->wjs->filePathMinExists($value['server'] . '/' . $name . '.css', 'css');
      if (file_exists($pathCss)) {
        $output['#data']['css'] = file_get_contents($pathCss);
      }
    }
    return $output;
  }
}
