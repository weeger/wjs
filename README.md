wjs - v2.5.22
=============

Copyright
---------
Copyright Romain WEEGER (weeger) 2010 / 2014
http://www.wexample.com

Licensed under the MIT and GPL licenses :
 - http://www.opensource.org/licenses/mit-license.php
 - http://www.gnu.org/licenses/gpl.html

Dependencies
------------
* jQuery
  http://jquery.com/
* jQuery inheritance plugin (included)
  https://github.com/dfilatov/jquery-plugins

Description
-----------
wJs is an AJAX Javascript / PHP loader. It provides dynamic transfert of custom
scripts packages between web clients and server. It contain an API to create
custom packages (collections) on server side and prepare it to be transferred to
Javascript, and to receive it on clients side (parsing it to use result in your
own applications).

w.load("packageType", "packageName", complete);

More than requireJs, witch is a powerful Javascript loader, wJs is able to
transfert not only Javascript, but potentially any custom kind of data. For
that, developers can create custom "loaders" to adjust behavior of it both on
server and client sides.

The original requirement of wJs was to load visual HTML elements in one shot,
witch is composed by not only one kind of data, ex : HTML + images urls + CSS +
some Javascript. In this way, wJs encourages to create independent libraries for
your scripts, then allow access them in one simple line of code.

wJs need to be used with the last version of jQuery and include a copy of the
dfilatov's jQuery's inherit plugin. It is free and open source, available for
forking and contribution on GitHub. If you want to post reviews, comments or
issues, please post on the project page.

Usage
-----
Usage documentation is a work in progress. Due to the lot of others projects, it
deeply depends of the requirement of users. If you need some help to understand
wJs, please contact us.

Thanks
------
I would like to thanks all people who have trusted an encouraged me, consciously
or not. Like all of my projects, this program is the result of a lot of
loneliness, questions, doubts, pain, but hope and love too.