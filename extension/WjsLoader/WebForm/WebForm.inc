<?php

namespace Wjs5\Loader;

require_once 'WebForm.class.inc';

use \Wjs5\Loader;

/**
 * @package Wjs\Loader
 */
class WebForm extends WebCom {

}

namespace Wjs5\Loader\WebForm;

class Extension extends \Wjs5\Loader\WebCom\Extension {
  var $classFile;
  var $className;

  function sessionInit() {
    if (session_status() === PHP_SESSION_NONE) {
      session_start();
    }
  }

  function add($settings) {
    parent::add($settings);
    $classPath = $this->serverPath . $this->extensionName . '.inc';
    if (is_file($classPath)) {
      require_once $classPath;
    }
    if (isset($_POST) && isset($_POST['formId']) &&
      // Url contains loader type
      isset($_GET) && isset($_GET[$this->extensionType])
    ) {
      // Start session.
      $this->sessionInit();
      // Session ID must exist.
      if (isset($_SESSION[$_POST['formId']])) {
        // Create instance.
        $form = $this->instance();
        // Destroy, prevent multiple submissions.
        unset($_SESSION[$_POST['formId']]);
        // Execute submit.
        print $form->submit($_POST);
      }
      exit;
    }
  }

  function push() {
    // Treat value as a classic WebCom
    $output = parent::push();
    // Start session.
    $this->sessionInit();
    $formId = 'form-' . md5(time() . rand(0, 1000));
    // Create a token.
    $output['#data']['formId'] = $formId;
    // Save into session.
    $_SESSION[$formId] = array(
      'formId'    => $formId,
      'formStamp' => time()
    );
    return $output;
  }

  /**
   * @return \Wjs5\Loader\WebForm\Form
   */
  function instance($options) {
    // Find page class name.
    $className = '\\Wjs5\\Loader\\' . $this->extensionType . '\\' . $this->extensionName;
    if (!class_exists($className)) {
      $className = '\\Wjs5\\Loader\\' . $this->extensionType . '\\Page';
    }
    if (!class_exists($className)) {
      $className = '\\Wjs5\\Loader\\WebForm\\Form';
    }
    // Create class.
    return new $className($this, $options);
  }
}
