<?php

require_once 'class/DemoWebsite.class.inc';

print (new DemoWebsite(__FILE__))->render('Home');
