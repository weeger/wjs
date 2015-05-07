<?php

// Load page configuration.
require_once dirname(__FILE__) . '/config.inc';

?><!DOCTYPE html>
<html>
<head>
  <!-- Welcome to the source code. -->
  <meta charset="UTF-8">
  <title>WJS - The discreet library</title>
  <meta name="description" content="Live demo website, free for download on GitHub." />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link type="text/css" rel="stylesheet" media="all" href="styles.min.css">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:site" content="@discreetLibrary" />
  <meta name="twitter:title" content="WJS - The discreet library" />
  <meta name="twitter:description" content="Live demo website, free for download on GitHub." />
  <meta name="twitter:image" content="http://wjs.wexample.com/logo.jpg" />
  <meta name="twitter:url" content="http://wjs.wexample.com" />

  <!-- Open Graph data -->
  <meta property="og:title" content="WJS - The discreet library" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="http://wjs.wexample.com/" />
  <meta property="og:image" content="http://wjs.wexample.com/logo.jpg" />
  <meta property="og:description" content="Live demo website, free for download on GitHub" />

  <!-- Here is the rendered header from WJS --><?php print $wjs->renderHeader(2); ?>

</head>
<body>

<h1><a href="wjs://DemoPage:Home">wjs</a></h1>

<h2>The discreet library</h2>

<!-- This is all my page content for start -->
<div id="main">
<!--  <div id="menu"></div>-->
<!--  <div id="loading"></div>-->
  <div id="main-offset">
    <div id="main-content">
      <div id="main-page-body"></div>
      <wjs-include type="WebComp:PrevNext"></wjs-include>
    </div>
  </div>
</div>


<!-- Thanks for watching to my code | Follow me @discreetLibrary -->
</body>
</html>
