<?php

// Load page configuration.
require_once dirname(__FILE__) . '/config.inc';

?><!DOCTYPE html>
<html>
<head>
  <!-- Welcome to the source code. -->
  <title>WJS - The discreet library</title>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link type="text/css" rel="stylesheet" media="all" href="styles.css">
  <!-- Here is the rendered header from WJS --><?php print $wjs->renderHeader(2); ?>

  <script type="text/javascript" src="script.js"></script>
</head>
<body>

<h1><a href="wjs://DemoPage:Home">wjs</a></h1>

<h2>The discreet library</h2>

<!-- This is all my page content for start -->
<div id="main">
  <div id="menu"></div>
  <div id="loading"></div>
  <div id="main-content">
    <div id="message"></div>
    <!-- Previous and next buttons is added by javascript -->
  </div>
</div>


<!-- Thanks for watching to my code | Follow me @discreetLibrary -->
</body>
</html>
