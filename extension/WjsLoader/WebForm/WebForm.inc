<?php

namespace Wjs5\Loader;

require_once 'WebForm.class.inc';

use \Wjs5\Loader;

/**
 * @package Wjs\Loader
 */
class WebForm extends WebCom {
  var $lastAdded;

  function sessionInit() {
    if (session_status() === PHP_SESSION_NONE) {
      session_start();
    }
  }

  function extensionAdd($name, $data) {
    $classPath = $data . $name . '.inc';
    if (is_file($classPath)) {
      require_once $classPath;
    }
    parent::extensionAdd($name, $data);
    if (isset($_POST) && isset($_POST['formId']) &&
      // Url contains loader type
      isset($_GET) && isset($_GET[$this->type])
    ) {
      // Start session.
      $this->sessionInit();
      // Session ID must exist.
      if (isset($_SESSION[$_POST['formId']])) {
        // Create instance.
        $form = $this->instance($name, $_SESSION[$_POST['formId']]);
        // Destroy, prevent multiple submissions.
        unset($_SESSION[$_POST['formId']]);
        // Execute submit.
        print $form->submitCall($_POST);
      }
      exit;
    }
  }

  function extensionPush($name, $options = array(), $value = NULL) {
    // Treat value as a classic WebCom
    $output = parent::extensionPush($name, $options, $value);
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
   * @param $name
   * @param $data
   *
   * @return \Wjs5\Loader\WebForm\Form
   */
  function instance($name, $data) {
    // Find page class name.
    $className = '\\Wjs5\\Loader\\' . $this->type . '\\' . $name;
    if (!class_exists($className)) {
      $className = '\\Wjs5\\Loader\\' . $this->type . '\\Page';
    }
    if (!class_exists($className)) {
      $className = '\\Wjs5\\Loader\\WebForm\\Form';
    }
    // Create class.
    return new $className($this->type, $name, $data, $this->wjs);
  }
}
