
COPYRIGHT
---------
Copyright Romain WEEGER 2010 / 2014
http://www.wexample.com

Licensed under the MIT and GPL licenses :

 - http://www.opensource.org/licenses/mit-license.php
 - http://www.gnu.org/licenses/gpl.html


DESCRIPTION
-----------
wJs is a Javascript package manager written in PHP, and working trough AJAX for
your personnal applications. It provides dynamic transfert of custom scripts
packages between web clients and server. It contain an API to create custom
packages (called collections to avoid conflicts with the "package" reserved
keyword of ECMAScript) on server side and prepare it to be transferred to
Javascript, and to receive it on clients side (parsing it to use result in your
own applications).

    w.load("packageType", "packageName", completeCallback);

More than requireJs, witch is a powerful Javascript loader, wJs is able to
transfert not only Javascript, but potentially any custom kind of data. For
that, developers can create custom "loaders" to adjust behavior of it both on
server and client sides.

The original requirement of wJs was to load visual HTML elements in one shot,
witch is composed by not only one kind of data, ex : HTML + images urls + CSS +
some Javascript. In this way, wJs encourages to create independent libraries for
your scripts, then allow access them in one simple line of code.

It is free and open source, available for forking and contribution on GitHub. If
you want to post reviews, comments or issues, please post on the project page.


FEATURES
--------
 - Load Javascript packages from client side.
 - Define custom packages types / loaders
 - Parse folders to register package automatically
 - Create libraries containing grouped definitions
 - Use PHP class ready to be transfert as Javascript prototypes (transcodes)
 - Use shorthands function for objects and prototypes manipulations


THANKS
------
I would like to thanks all people who have trusted an encouraged me, consciously
or not. Like all of my projects, this program is the result of a lot of
loneliness, questions, doubts, pain, but hope and love too. I sincerely hope
you'll enjoy it. Thanks to Carole for her incredible Love.

