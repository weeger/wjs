<?php

namespace Wjs5;

/**
 * Atom class is used to manage objects with grouped parameters.
 * They are used as base object to have contextualised options and location paths.
 * @package Wjs
 */
class Atom {
  /**
   * @var string[] Required options expected to be defined at object creation.
   */
  var $optionsRequired = array();
  /**
   * @var string[] Default values.
   */
  var $default = array();
  /**
   * @var string[] Save options internally.
   */
  var $options = array();
  /**
   * Debug level.
   */
  var $errorLevel = E_USER_WARNING;

  /**
   * Construct object with predefined options.
   *
   * @param array|null $options
   */
  function __construct($options = NULL) {
    // Allow to set paths to null, but creates options array instead.
    // This is useful to not manage that in subclasses.
    $options = $options === NULL ? array() : $options;
    // Merge options with default values.
    $options = array_merge($this->default, $options);
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
   *
   * @param string $name
   * @param string $value
   */
  function optionSet($name, $value) {
    $this->options[$name] = $value;
  }

  /**
   * Return value of a option.
   * It avoid to use isset each time an option is required.
   *
   * @param string $name
   *
   * @return null|string
   */
  function optionGet($name) {
    // Return requested option if exists.
    return (isset($this->options[$name])) ? $this->options[$name] : NULL;
  }

  /**
   * Trigger w error.
   *
   * @param string $message
   */
  function error($message) {
    trigger_error('w error : ' . $message, $this->errorLevel);
    exit;
  }

  /**
   * Convert windows backslashes into paths to linux slashes.
   * Backslashes may pose problems when different slashes types
   * are mixed into a path in client side.
   *
   * @param string $path
   *
   * @return string
   */
  function pathCleanupSlashes($path) {
    return str_replace('\\', '/', $path);
  }

  /**
   * Transform a server side path to a client side path.
   * Return a client path, relatively to the current working directory.
   * All path used by this function to be located on client side
   * should be placed into this working directory by as symlink or not.
   *
   * @param string      $serverPathAbsolute
   * @param string      $serverWorkingDirectory
   * @param string|null $clientRequestDirectory
   *
   * @return string
   */
  function clientPath($serverPathAbsolute, $serverWorkingDirectory, $clientRequestDirectory = NULL) {
    // Relative position from site base path used
    // to find site root before to reach path.
    return $this->pathRelative($clientRequestDirectory,
      $this->pathRelative($serverWorkingDirectory, $serverPathAbsolute)
    );
  }

  /**
   * Get dir name without resolving symlinks.
   *
   * @param string $path
   *
   * @return string
   */
  function pathDirName($path) {
    $parts = explode('/', $this->pathNormalize($path));
    array_pop($parts);
    return implode('/', $parts);
  }

  /**
   * Return relative path from a file to another.
   *
   * @param string $from
   * @param string $to
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
   * @param string $path
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
