<?php

namespace Wjs\Loader;

require_once WJS_ROOT . 'extension/WjsLoader/WebComp/WebComp.inc';

class Binder extends WebComp {
  // Do not use WebComp css links detection.
  var $requireCssLinks = FALSE;
  function extensionPush($name, $excludeRequire = FALSE, $value = NULL) {
    $value  = $this->valuePush($name, $value);
    $output = parent::extensionPush($name, $excludeRequire, $value);
    if (!$this->valueIsError($value)) {
      // CSS
      $pathCss = $this->wjs->filePathMinExists($value['server'] . '/' . $name . '.css', 'css');
      if (file_exists($pathCss)) {
        $output['#data']['css'] = file_get_contents($pathCss);
      }
    }
    return $output;
  }
}
