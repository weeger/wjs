wJs is an AJAX Javascript / PHP loader. It provides dynamic transfert of custom scripts packages between web clients and server. It contain an API to create custom packages (collections) on server side and prepare it to be transferred to Javascript (like compressing scripts, get dependencies or manage caching), and to receive it on clients side (parsing it to use result in your own applications).

w.load("packageType", "packageName", complete);
More than requireJs, witch is a powerful Javascript loader, wJs is able to transfert not only Javascript, but potentially any custom kind of data. For that, developers can create custom "loaders" to adjust behavior of it both on server and client sides.

The original requirement of wJs was to load visual HTML elements in one shot, witch is composed by not only one kind of data, ex : HTML + images urls + CSS + some Javascript. In this way, wJs encourages to create independent libraries for your scripts, then allow access them in one simple line of code.

wJs need to be used with the last version of jQuery and include a copy of the dfilatov's jQuery's inherit plugin. It is free and open source, available for forking and contribution on GitHub. If you want to post reviews, comments or issues, please post on the project page.