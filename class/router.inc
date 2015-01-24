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
    // This is useful to not manage that in subclasses.
    $routes = $routes === NULL ? array() : $routes;
    // Merge routes with default values.
    $routes = array_merge_recursive($this->routeDefault, $routes);
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
   * Subtract base path from full path.
   */
  function pathSubtract($basePath, $fromFullPath) {
    return trim(substr($fromFullPath, strlen($basePath)));
  }

  /**
   * Return relative path from a file to another.
   *
   * @param $from
   * @param $to
   *
   * @return string
   */
  function pathRelative($from, $to) {
    // some compatibility fixes for Windows paths.
    $from    = is_dir($from) ? rtrim($from, '\/') . '/' : $from;
    $to      = is_dir($to) ? rtrim($to, '\/') . '/' : $to;
    $from    = $this->pathCleanupSlashes($from);
    $to      = $this->pathCleanupSlashes($to);
    $from    = explode('/', $from);
    $to      = explode('/', $to);
    $relPath = $to;
    foreach ($from as $depth => $dir) {
      // find first non-matching dir
      if ($dir === $to[$depth]) {
        // ignore this directory
        array_shift($relPath);
      }
      else {
        // get number of remaining dirs to $from
        $remaining = count($from) - $depth;
        if ($remaining > 1) {
          // add traversals up to first matching dir
          $padLength = (count($relPath) + $remaining - 1) * -1;
          $relPath   = array_pad($relPath, $padLength, '..');
          break;
        }
        else {
          $relPath[0] = './' . $relPath[0];
        }
      }
    }
    return implode('/', $relPath);
  }

  /**
   * Transform a path like :
   *   ../a/b/c/../d/
   * Into :
   *   ../a/b/d
   *
   * @param $path
   *
   * @return string
   */
  function pathNormalize($path) {
    $path = $this->pathCleanupSlashes($path);
    $root = ($path[0] === '/') ? '/' : '';

    $segments = explode('/', trim($path, '/'));
    $ret      = array();
    $relBase = TRUE;
    foreach ($segments as $segment) {
      if ($segment !== '.' && !empty($segment)) {
        if ($segment == '..' && !$relBase) {
          array_pop($ret);
        }
        else {
          if ($segment !== '..') {
            $relBase = FALSE;
          }
          array_push($ret, $segment);
        }
      }
    }
    return $root . implode('/', $ret);
  }
}