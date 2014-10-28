<?php

namespace Wjs;

/**
 * Router class is used to manage objects with routing parameters.
 * They are used as localizable objects on server or client sides.
 * @package Wjs
 */
class Router {
  // Required routes expect to be defined at object creation.
  var $routeRequired = array();
  var $routeDefault = array();
  var $routes = array();

  /**
   * Construct object with predefined routes.
   */
  function __construct($routes = array()) {
    // Allow to set paths to null, but creates route array instead.
    $routes = $routes === NULL ? array() : $routes;
    // Search for unfilled required routes.
    foreach ($this->routeRequired as $side => $routeRequired) {
      if (!isset($routes[$side])) {
        trigger_error('wjs router error : Missing routes side : ' . $side . ' for ' . get_class($this), E_USER_ERROR);
      }
      else if ($routeRequired !== (array_intersect($routeRequired, array_keys($routes[$side])))) {
        trigger_error('wjs router error : Missing routes : ' . $side . ' > ' . implode(',', array_diff($routeRequired, array_keys($routes[$side]))), E_USER_ERROR);
      }
    }
    // Use common method to save multiple routes.
    $this->routeAddMultiple($routes);
  }

  /**
   * Set value of a route.
   */
  function routeAdd($side, $name, $value) {
    $this->routes[$side][$name] = $value;
  }

  /**
   * Return value of a route.
   */
  function routeGet($side, $name) {
    // Return requested route if exists.
    return (isset($this->routes[$side][$name])) ? $this->routes[$side][$name] : '';
  }

  /**
   * Save multiple routes in one time.
   */
  function routeAddMultiple($side, $routes = NULL) {
    if (is_array($side)) {
      foreach ($side as $key => $routes) {
        $this->routeAddMultiple($key, $routes);
      }
      return NULL;
    }
    // Set routes.
    if ($routes !== NULL) {
      foreach ($routes as $name => $value) {
        $this->routeAdd($side, $name, $value);
      }
    }
  }

  /**
   * Trigger an error if route does not exists.
   *
   * @param $side
   * @param $name
   */
  function routeRequire($side, $name) {
    if (!isset($this->routes[$side][$name])) {
      trigger_error('Undefined route "' . $side . '" > "' . $name . '"');
    }
  }

  /**
   * Convert windows backslashes into paths to linux slashes.
   * Backslashes may pose problems when paths are concatenated
   * then exported to client side, not supported by FF.
   */
  function pathCleanupSlashes($path) {
    return str_replace('\\', '/', $path);
  }

  /**
   * Return relative path from a given path.
   */
  function pathSubtract($basePath, $fromFullPath) {
    return trim(substr($fromFullPath, strlen($basePath)));
  }
}