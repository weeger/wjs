<?php

namespace Wjs\Loader\WjsLibrary;

class GoogleAnalytics extends Library {
  var $id = 'UA-XXXXXXXX-X'; // UA-XXXXXXXX-X

  function init($options) {
    $this->id = $options['id'];
  }

  function renderBodyFooter() {
    return $this->id ? "<script>" .
    "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){" .
    "(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o)," .
    "m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)" .
    "})(window,document,'script','//www.google-analytics.com/analytics.js','ga');" .
    "ga('create', '" . $this->id . "', 'auto');" .
    "ga('send', 'pageview');</script>" : '<!-- GOOGLE ANALYTICS -->';
  }
}
