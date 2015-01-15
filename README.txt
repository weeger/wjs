

Introduction
============

![Alt text](wjs-logo.png?raw=true "The discreet library")
Would not it be good to start to take a tour on our demo live sites : 

- The standalone <a target="_blank" href="http://wjs.wexample.com">demo website</a>
- The <a target="_blank" href="http://drupal6.wexample.com">Drupal demo website</a>
- The <a target="_blank" href="http://wjs.wexample.com/quick_start/">Quick Start site</a>
- Download <a target="_blank" href="http://wjs.wexample.com/wjs-quick_start.zip">Quick Start ZIP file</a>
- The <a target="_blank" href="https://www.drupal.org/sandbox/weeger/2393707">Drupal Sandbox</a>
- The <a target="_blank" href="http://wemplate.wexample.com?p=1C2A8&changes=1">Wemplate project</a> which wjs is a part of.

Load everything you need as an extensions package. Wjs is an entry point to make your Javascript web app retrieve assets from your server, via AJAX, or not. Everything is an extension with wjs : script, image, html, etc..., and all extensions can load dependencies. This library is for you, if you want to :

- Create little lightweight one page sites with full lazy loading (js methods, classes, images, links, etc...).
- Load complex packages from your PHP application to javascript, in a minimum of requests.
- Instantiate javascript class objects. 

It is really lightweight and infinitely extensible by your own application components. Obviously, it requires a minimum of configuration before...

Install
=======

Download wjs zip file or use `npm install wjs`. Even you can download wjs via npm it does not work with node.js and require method.

Configuration
=============

After downloading and installing wjs into your library folder, there is still three important steps required to work properly with wjs, and various way to achieve it :

- Register content you make available to transfer 
- Configure your javascript header 
- Handle ajax requests


Create a Wjs instance
---------------------

The quickest method to start is to instantiate wjs with no arguments.

On server side : 
```php
$wjs = new \Wjs();
```

Otherwise you can define more configuration settings.

On server side : 
```php
$wjs = new \Wjs(array(
  'server' => array(
    // Path to wjs is used by wjs to retrieve
    // core scripts and internal library.
    'wjs'              => $pathToWjsLibrary,
    // If you want to use cache, you have
    // to specify route for the local directory,
    // it will be filled by all aggregated javascript and responses.
    'cacheDir'         => $yourCustomCacheDirectory,
    // You can specify a file for main
    // javascript file for complete page.
    'cacheFileStartup' => $yourCustomCacheFileStartup,
    // You can also specify a extra string
    // for cache files naming. Useful to enforce
    // to flush browsers caches.
    'cacheToken'       => $yourCustomCacheToken,
  ),
  'client' => array(
    // Path to wjs directory from client side.
    // Used to generate proper based paths
    // on using the jsFiles() method.
    'wjs'              => $pathToWjsFromClientSide,
    // Response path define the URL used by AJAX
    // to retrieve extensions on your server, you
    // obviously need to handle the path on server
    // side, see bellow.
    'responsePath'     => $yourCustomResponsePath,
    // If you want to use cache, you should also
    // specify paths from client side.
    'cacheDir'         => $yourCustomCacheDirectory,
    'cacheFileStartup' => $yourCustomCacheFileStartup,
  )
  // Optional, by default use "master" version (minified),
  // Accepts also "jQuery" or "source" for debug mode.
), $jsCoreFilesVersion);
```


Register your extensions
------------------------

Registering extensions is not pushing them to the frontend, it just define which of them may be retrieved by client. A common usage is to register library both for normal and AJAX responses, and define pushed data separately for each context. You may also take a look to summaries for more information about extension registration.

Registered data is also depending of each loader behavior, more information on loaders specific section.

On server side : 
```php
$wjs->extensionAdd('JsArray', 'myTestArray', array(
  0 => 'MyItem',
));
```


Linking Javascript
------------------

Adding javascript into your html page make the connexion between server and client environment. Due to the variation of loaders, preloaded extensions, or platforms where wjs can be included, the files included can change a lot from on page to another. Some tools are included into wjs to help you to achieve this point. To start the most quickly with wjs, just put this PHP code into your document "head" :

```php
<?php print $wjs->renderHeader(4); ?>
```

If you want more control on the way you integrates the links, there is a mor detailed method to use :
```php
// Retrieve list of files used by core
$files = $wjs->jsFiles();
```
This method will return js files used by core, depending of the core version used, the loaders defined, and required. Ex:

```php
array(
  'js/wjs.js',
  'js/loader.js',
  'js/process.js',
  'loader/jsScript/jsScript.js',
  'loader/wjsLoader/wjsLoader.js',
);
```

You can now include these links into your html page. The next point is to init wjs. This action will unpack pushed content from PHP, and execute startup function (see "ready" method).
On client side : 
```javascript
wjs.init(<?php print $wjs->initPackage(); ?>);
```



Handle requests
---------------

You have now connected client to server wjs instances, you have also defined which data you allow to transfer. Great. Now, you can handle requests from client to serve required data. Requests from wjs are made by GET method using query string names defined into settings. Ex:


```php
print_r($_GET['wjs']);
/*
 * Array (
 *   [0] => Array (
 *     [t] => jsArray
 *     [n] => testArray
 *   )
 * )
 */
```

So you can filter and manage returned content.
```php
// Think about always make some verification on requested content.
if (isset($_GET['wjs']['JsArray']) && $_GET['wjs']['JsArray'] === 'testArray') {
  // Manage which data to retrieve.
  $wjs->import('JsArray', 'testArray');
  // When response is ready to be sent,
  // this function will add json headers,
  // print package content, then exit.
  $wjs->response();
}
```


A simple method has been made for quickly handle client requests, but always think about filtering data from get before to use it.
```php
// This will return requested data from GET,
// and manage print and exit, in one time.
$wjs->response($_GET);
```




Remote loading
==============

Wjs uses loaders to retrieve data from server, and parse it. Several loaders are included into wjs core, you can also build your own loader type. AJAX requests are asynchronous by default, it let you integrate requests into the flow of your scripts, but you can also prefer to load your scripts asynchronously, and use a "complete" callback to continue your actions.

Simple Javascript Object
------------------------

On server side : 
```php
// Add array as a JsObject.
$wjs->extensionAdd('JsObject', 'testObject', array(
  'thisIs'        => 'ATest',
  'thisIsAlso'    => 'AnOtherTest',
  'thisIsANumber' => 123,
  'thisIsAnArray' => array('foo' => 'bar')
));
```
On client side : 
```javascript
wjs.use('JsObject', 'testObject', function () {
  continueCallback();
});
```


Simple Javascript Array
-----------------------

Like objects, you can also append data as javascript arrays. Note that array keys will be turned to indexes only if not numeric, as JavaScript arrays do not support string indexes (otherwise use JsObjects). 

On server side : 
```php
$wjs->extensionAdd('JsArray', 'testArray', array(
  0           => 'ATest',
  1           => 'AnOtherTest',
  'keysWill'  => 123,
  'disappear' => array(0 => 'bar')
));
```
On client side : 
```javascript
// Will return : ["ATest", "AnOtherTest", 123, Array[1]]
wjs.use('JsArray', 'testArray', function (arrayContent) {
  continueYourScript(arrayContent);
});
```


Javascript code
---------------

You can easily add simple javascript code for your own usage. 

On server side : 
```php
// Add a remote file.
$wjs->extensionAdd('JsScript', 'testScriptFile', $filePath);
// Add an inline code.
$wjs->extensionAdd('JsScript', 'testScriptInline', 'window.jsScriptInlineLoaded = true;');
// Add reloadable script,
// it will increment global var at each pull, with the reload:true option.
$wjs->extensionAdd('JsScript', 'jsScriptReloadable', 'window.jsScriptReloadCount===undefined ? window.jsScriptReloadCount = 0 : window.jsScriptReloadCount++;');
```
On client side : 
```javascript
// If loader do not exists, it will be loaded first.
wjs.use('JsScript', 'testScriptFile', function () {
  console.log(window.jsScriptFileLoaded); // true
  // Inline script will be executed as well.
  wjs.use('JsScript', 'testScriptInline', function () {
    console.log(window.jsScriptInlineLoaded); // true
    continueYourScript();
  });
});
```


Javascript methods
------------------

You can load simple javascript methods with wjs, asynchronously or not, and execute it in your code. Some methods are included into wjs core, as example.

On server side : 
```php
// Add javascript method from a file.
$wjs->extensionAdd('JsMethod', 'testMethod', 'projects/wjs/tests/objects/JsMethod/testMethod.js');
```
Your Js file must also be wrapped, it allows wjs to catch it :

```javascript
(function (loader) {
  'use strict';
  // <--]
  /**
   * Return length of own properties of a given object.
   * @param {Object} object
   * @return {number}
   */
  loader.addJsMethod('testMethod', function (object) {
    var size = 0, key;
    for (key in object) {
      if (object.hasOwnProperty(key)) {
        size += 1;
      }
    }
    return size;
  });
  // [-->
}(loader));

```

On client side : 
```javascript
// The retrieved method will return the length of an object.
var length = wjs.use('JsMethod', 'testMethod', function (reg) {
  var length;
  var method = reg.JsMethod.testMethod;
  var testObject = {
    'lorem': 'ipsum',
    'dolor': 'sit',
    'amet': 'poireau'
  };
  // Return 3
  length = method(testObject);
  // Or
  length = wjs.testMethod(testObject);
  continueYourScript();
});
```



Image loading
-------------

You can also use wjs to retrieve images, and use it only when load complete. Images do not need to be packed on server side. 

On client side : 
```javascript
// We load the HTML5 Image Logo
wjs.use('Image', 'http://www.w3.org/html/logo/downloads/HTML5_Logo_512.png', {
  complete: yourCustomCallback
});
```


Javascript links
----------------

wjs is also able to append script links into your pages.

On client side : 
```javascript
// We load an external js.
wjs.use('JsLink', pathToYourJsFile, {
  complete: yourCustomCallback
});
```


But also several links, if you need to add them in a specific order
On client side : 
```javascript
// If several links are declared from an array,
// All links are loaded, in order. Each link wait for
// the previous one to be loaded.
wjs.use({JsLink: [
  pathToYourJsFile2,
  pathToYourJsFile3
]
}, yourCustomCallback2);
```


CSS links
---------

Like .js, you can also retireve css links, as link tags. They will be appended to your document head.

On client side : 
```javascript
// We load an external js.
wjs.use('CssLink', pathToYourCssFile, {
  complete: yourCustomCallback
});
```


And for multiple css. On client side : 
```javascript
// If several links are declared from an array,
// All links are loaded, in order. Each link wait for
// the previous one to be loaded,
// wrong css links do not block the process.
wjs.use({
  CssLink: [pathToYourCssFile2, pathToYourCssFile3]
}, yourCustomCallback2);
```


Loaders
-------

Now enter in the craziness of wjs.. Now you can also load loaders as extensions. It allow to load your page only with wjs and the core wjsLoader, then load every loader you need later.

On server side : 
```php
// We add a loader, this one exists in wjs core,
// so this action is just here for example.
$wjs->extensionAdd('WjsLoader', 'jsArray', array(
  'server' => array(
    // Contain a class who extends the base
    // \Wjs\Loader class.
    'class' => $pathToPHPFileOnServer,
    // Path to JS from server is required in case of
    // cache enabling. It will be reached to
    // aggregate scripts.
    'js'    => $pathToJsFileFromServer
  ),
  'client' => array(
    'js' => $pathToJsFileFromClient
  )
));
```
On client side : 
```javascript
// First we load loader,
// this action is also for example,
// in real life, wjs make this action
// automatically when pull a script.
wjs.use('WjsLoader', 'JsArray', function () {
  // Then we load script.
  wjs.use('JsArray', 'testArray', continueCallback);
});
```
Obviously you should declare your loader into a separated javascript file. See into wjs core for more info.

Web components
--------------

The WebComp type allow to retrieve basic web components, composed by CSS, HTML, and Javascript.

Web pages
---------

The WebPage type is a subclass of WebComp, designed to update page URL automatically on load.

Groups
------

Group take an array as argument, containing a list of extensions from all other types.

Cache links
-----------

Cache links are core JsLinks which can not be excluded from requests.

JsClass
-------

Used to retrieve javascript objects class, currently in work in progress.

JsClass
-------

Static class are instantiated only once per page. This is a handy way to define group of function grouped inside one class instance.



Dependencies
------------

Defining and controlling dependencies allows you to make your requests more efficients, by retrieving multiple extensions in one request. A "A" extension can bring with it a "B" or a "C" one, if you defined it before pushing your data.

Define requirement
------------------

A simple function allows you to connect an extension to another one.

On server side : 
```php
// Extension of type JsObject > testObject,
// will be loaded with  JsObject > testObject2 when asked.
$wjs->extensionAddRequire('JsObject', 'testObject', 'JsObject', 'testObject2');
```


Exclude dependencies
--------------------

A dangerous point with dependencies is to retrieve multiple times the same extensions. If "A" and "B" need "C" extensions, you'll probably load it two times. You can define options on your request to ask to not retrieve dependencies. It is useful to control when you know that required extensions are already loaded.

On client side : 
```javascript
// We don't want any dependency.
object = wjs.use('JsObject', 'testObject', {
  exclude: true,
  complete: continueCallback
});
```

Or more precisely. On client side : 
```javascript
// We don't want multiple dependencies, but we allow others.
object = wjs.use('JsObject', 'testObject', {
  // We don't want these dependencies.
  exclude: {
    JsObject: ['testObject2'],
    JsArray: ['testArray2']
  },
  complete: continueCallback
});
```




Settings
--------

Various settings can be configured into wjs to let you define wjs behavior, like used paths, query string names, etc...

- responsePath : Path used from client to retrieve packages in AJAX.
- paramExtra : Extra parameters added into AJAX requests, empty by default.
- paramInc : Define the key of the get variable used for remote requests.
- paramExc : Define the key of the get variable used for excluded extensions dependencies.

Document ready
--------------

To wjs to be loaded before using it, you should wrap your scripts into the wjs.ready(callback); function. It ensure the callback to be executed after your page loading and also after wjs initialization. On client side : 
```javascript
w.ready(function(){ 
  console.log("Ready to pull !"); 
  // Place here your wjs.use() requests.
})
```


Prototyping
-----------

wJs allow you to instantiate easily classes prototype. The method is used internally by wJs and can be reused. This method respects javascript getters and setters declaration. 

On client side : 
```javascript
// Registers a new class prototype.
wjs.classExtend("className",{ ... });
// Create a new registered class instance.
var instance = (new wjs.classProto("className"))(arguments);
```

Copyright
---------
Copyright Romain WEEGER 2010 / 2014
http://www.wexample.com

Licensed under the MIT and GPL licenses :

 - http://www.opensource.org/licenses/mit-license.php
 - http://www.gnu.org/licenses/gpl.html

Thanks
------
I would like to thanks all people who have trusted an encouraged me, consciously or not. They are not many. Like all of my projects, this program is the result of a lot of questions, doubts, pain, but joy and love too. I sincerely hope you'll enjoy it. Thanks to Carole for her incredible Love.

