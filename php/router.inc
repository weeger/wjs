<?php

namespace Wjs;

/**
 * Router class is used to manage objects with grouped parameters.
 * They are used as base object to have contextualised options and location paths.
 * @package Wjs
 */
class Router {
  /**
   * Required options expected to be defined at object creation.
   */
  var $optionsRequired = array();
  /**
   * Default values.
   */
  var $optionsDefault = array();
  /**
   * Debug level.
   */
  var $errorLevel = E_USER_WARNING;
  /**
   * Save options internally.
   */
  var $options = array();

  /**
   * Construct object with predefined options.
   */
  function __construct($options = NULL) {
    // Allow to set paths to null, but creates options array instead.
    // This is useful to not manage that in subclasses.
    $options = $options === NULL ? array() : $options;
    // Merge options with default values.
    $options = array_merge($this->optionsDefault, $options);
    // Search for unfilled required options.
    foreach ($this->optionsRequired as $optionsRequired) {
      if (!isset($options[$optionsRequired])) {
        $this->error('Missing options : ' . $optionsRequired . ' for ' . get_class($this), E_USER_ERROR);
      }
    }
    // Save options.
    $this->options = $options;
  }

  /**
   * Set value of a option.
   */
  function optionSet($name, $value) {
    $this->options[$name] = $value;
  }

  /**
   * Return value of a option.
   * It avoid to use isset each time an option is required.
   */
  function optionGet($name) {
    // Return requested option if exists.
    return (isset($this->options[$name])) ? $this->options[$name] : NULL;
  }

  /**
   * Trigger wjs error.
   */
  function error($message) {
    trigger_error('wjs error : ' . $message, $this->errorLevel);
  }

  /**
   * Convert windows backslashes into paths to linux slashes.
   * Backslashes may pose problems when different slashes types
   * are mixed into a path in client side.
   */
  function pathCleanupSlashes($path) {
    return str_replace('\\', '/', $path);
  }

  /**
   * Transform a server side path to a client side path.
   * Return a client path, relatively to the current working directory.
   * All path used by this function to be located on client side
   * should be placed into this working directory by as symlink or not.
   */
  function pathClient($pathServerAbsolute, $serverWorkingDirectory, $clientRequestDirectory = NULL) {
    // Relative position from site base path used
    // to find site root before to reach path.
    return $this->pathRelative($clientRequestDirectory,
      $this->pathRelative($serverWorkingDirectory, $pathServerAbsolute)
    );
  }

  /**
   * Get dir name without resolving symlinks.
   */
  function pathDirName($path) {
    $parts = explode('/', $this->pathNormalize($path));
    array_pop($parts);
    return implode('/', $parts);
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
    $from = $this->pathNormalize($from);
    // Need clean paths.
    $from    = explode('/', $from);
    $relPath =
    $to = explode('/', $this->pathNormalize($to));
    foreach ($from as $depth => $dir) {
      // Find first non-matching dir.
      if (isset($to[$depth]) && $dir === $to[$depth]) {
        // Ignore this directory
        array_shift($relPath);
      }
      else {
        // Get number of remaining dirs to $from.
        $remaining = count($from) - $depth;
        if ($remaining > 1) {
          // Add traversals up to first matching dir.
          $padLength = (count($relPath) + $remaining - 1) * -1;
          $relPath   = array_pad($relPath, $padLength, '..');
          break;
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
    // Avoid empty case.
    if (!$path) {
      return $path;
    }
    $path = $this->pathCleanupSlashes($path);
    // Avoid basic cases.
    if ($path === '/') {
      return $path;
    }
    $prefix = ($path[0] === '/') ? '/' : '';
    // Support URLs (avoid part before ://).
    if ($prefix === '' && strpos($path, '://') !== FALSE) {
      $exp    = explode('://', $path);
      $prefix = $exp[0] . '://';
      $path   = $exp[1];
    }
    $segments = explode('/', trim($path, '/'));
    $suffix   = (substr($path, -1) === '/') ? '/' : '';
    $relBase  = TRUE;
    $output   = array();
    foreach ($segments as $segment) {
      if ($segment !== '.' && !empty($segment)) {
        if ($segment == '..' && !$relBase) {
          array_pop($output);
        }
        else {
          if ($segment !== '..') {
            $relBase = FALSE;
          }
          array_push($output, $segment);
        }
      }
    }
    return $prefix . implode('/', $output) . $suffix;
  }
}
