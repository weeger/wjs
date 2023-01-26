

Introduction
============

[![Join the chat at https://gitter.im/weeger/wjs](https://badges.gitter.im/weeger/wjs.svg)](https://gitter.im/weeger/wjs?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

![Alt text](logo.png?raw=true "The discreet library")
Wjs is a front end development toolkit designed to bring a new user experience to web clients, by increasing interactions between browser and server, supporting a full dynamic navigation with no pages reloads, and providing an advanced object oriented programming interface supporting plugins, keyframe rendering, and so on... Wjs is still in development, all features are not fully working yet.

Wjs is now accessible from <a target="_blank" href="http://microjs.com">microjs.com</a>, the Fantastic Micro-Frameworks and Micro-Libraries for Fun and Profit.

Check out the <a target="_blank" href="http://wjs.wexample.com">demo website</a>,and fork it on his <a target="_blank" href="https://github.com/weeger/weeger">Github repository</a>.

You can support us on <a href="http://funding.openinitiative.com/funding/2150/">OpenInitiative</a>, <a target="_blank" href="http://wjs.wexample.com">Kickstarter</a>.It is actually written in Javascript for the client part, and PHP for the server part. It is also ready to be translated into every other server side languages, depending of needs. 

Features :
- AJAX Loading with server side package management
  - Dependencies declaration
  - Dependencies auto loading
  - Automated HTML head links generation
  - Page preloaded extensions support
  - Preloaded files caching
  - Preloaded files aggregation
  - Several types of loaders : CSS, JS, Files, etc...
  - Native useful methods
    - AudioTrackPlayer
    - AudioTrackPlayerTrack
    - BezierEasing
    - MathEuler
    - MathMatrix4
    - MathQuaternion
    - MathVector3
    - ThreeCamera
    - ThreeObject3d
    - AccelerometerListener
    - DisableCtrlS
    - Math
    - MousePositionListener
    - QueueManager
    - ScrollManager
    - webPageKeyboardChange
- Web components management
  - Separated folders for each component
  - Support simple HTML / CSS data
  - Extra files paths rewriting
  - Hybrid API for objects description
    - Parsed to real javascript inherited objects
  - Construct / destruct methods
  - Local setters and getters
  - Options management system
  - Events listeners
  - Methods inheritance
  - Multiples states management
  - States connections between objects
  - Basic Clip / Sprite / Stage objects
    - Centered position
    - CSS animation fades
    - 3D features
- Advanced HTML elements (beta)
  - Plugins support
  - Parent / children management
  - Keyframe animation management
  - Formula object support
- Website OOP class (beta)
  - Dynamic page loading
  - Libraries loading
- Source version or minified- Headless support (no server side)

Wjs is made for you if : 
- You are a very special person
- You are seeking a lazy loader (to load almost any type of data)
- You want to try a new way to create rich web interfaces
- You want to bring to your user a fresh navigation system
- You need advanced javascript objects supporting listening, dependencies management, animation keyframes, etc... 

Wjs is NOT for you if you are seeking a handy Javascript only library (like jQuery, Backbone, etc...). We are seeking for contributors for this project to report comments, bugs, improvements or compatibility support. All kind of reaction are appreciated.


Wjs is lightweight and infinitely extensible with usage of custom extension declaration and dependencies management. Obviously, it requires a minimum of configuration before. The following install guide is poorly maintained due to the amount of work of the library itself, please contact us for more information.

Install
=======

Download wjs zip file or use `npm install wjs`. Even you can download wjs via npm it actually does not work with node.js and require method.

Configuration
=============

There is three important steps required to work properly with wjs, and different way to achieve it :

- Register available content you want to transfer via AJAX
- Configure your html head
- Handle ajax requests on server side

After these steps you will be able to use the basic javascript method :  
```javascript
wjs.use("Type", "Name");
```


Create a Wjs instance
---------------------

The quickest method to start is to instantiate wjs with no arguments.

On server side : 
```php
$wjs = new Wjs();
```

Otherwise you can define more configuration settings.

On server side : 
```php
// Add only option that you explicitly need,
// any option are required.
$wjs = new \Wjs(array(
  // Optional, by default use "master" version (minified),
  // Accepts also "jQuery" or "source" for debug mode.
  'subversion'          => $subversion,
  // Response path define the URL used by AJAX
  // to retrieve extensions on your server, you
  // obviously need to handle the path on server
  // side, see bellow.
  'clientPathResponse'  => $yourCustomResponsePath,
  // If you want to use static cache, you have
  // to specify route for the local directory,
  // it will be filled by all aggregated javascript and responses.
  'serverPathCache'     => $yourCustomCacheDirectory,
  // Caching will generate aggregated javascript
  // file and will place it into given directory
  // according to pushed data for requested url.
  'staticFilesEnabled'  => $staticFilesEnabled,
  // Force to regenerate existing files.
  'staticFilesFlush'    => $staticFilesFlush,
  // Allow to merge all preloaded extensions
  // and core js files into one js file.
  'aggregationEnabled'  => $aggregationEnabled,
  'aggregationFlush'    => $aggregationFlush,
  // You can specify a file for main
  // javascript file for complete page rendering,
  // All files will be aggregated into one file,
  // remember that this file content can completely change
  // from one page to another, so think to name it accordingly.
  'aggregationFileName' => $yourCustomCacheFileName,
  // You can also specify a extra string
  // for cache files naming. Useful to enforce
  // to flush browsers caches.
  'cacheToken'          => $yourCustomCacheToken,
  'paramInc'            => 'wjs-test'
));
```


Register your extensions
------------------------

Registering extensions is not pushing them to the frontend, it just define which of them may be retrieved by client. A common usage is to register library both for normal and AJAX responses, and define pushed data separately for each context. You may also take a look to summaries for more information about extension registration.

Registered data is also depending of each loader behavior, more information on loaders specific section.

On server side : 
```php
$this->wjs->extensionAdd('JsArray', 'myJsArrayCustomName', array(
  0 => 'MyItem',
));
```


Linking Javascript
------------------

Adding javascript into your html page make the connexion between server and client environment. Due to the variation of loaders, preloaded extensions, or platforms where wjs can be included, the files included can change a lot from on page to another. Some tools are included into wjs to help you to achieve this point. To start the most quickly with wjs, just put this PHP code into your document "head" :

```php
print $wjs->renderHeader(4);
```

If you want more control on the way you integrates the links, there is a mor detailed method to use :
```php
// Retrieve list of files used by core
$files = $wjs->jsFiles();
```
This method will return js files used by core, depending of the core version used, the loaders defined, and required.

You can now include these links into your html page. The next point is to init wjs. This action will unpack pushed content from PHP, and execute startup function (see "ready" method).
On client side : 
```javascript
new WjsProto(<?php print $wjs->initPackage(); ?>);
```



Handle requests
---------------

You have now connected client to server wjs instances, you have also defined which data you allow to transfer. Great. Now, you can handle requests from client to serve required data. Requests from wjs are made by GET method using query string names defined into settings. A simple method has been made for quickly handle client requests, but always think about filtering data from get before to use it.
```php
$wjs->response($_GET);
```
So you can filter and manage returned content.
```php
// Think about always make some verification on requested content.
if (isset($_GET['wjs']['JsArray']) && $_GET['wjs']['JsArray'] === 'myJsArrayName') {
  // Manage which data to retrieve.
  $wjs->import('JsArray', 'myJsArrayName');
  // When response is ready to be sent,
  // this function will add json headers,
  // print package content, then exit.
  $wjs->response();
}
```






Remote loading
==============

Wjs uses loaders to retrieve data from server, and parse it. Several loaders are included into wjs core, you can also build your own loader type. AJAX requests are asynchronous by default, it let you integrate requests into the flow of your scripts, but you can also prefer to load your scripts asynchronously, and use a "complete" callback to continue your actions.

Simple Javascript Object
------------------------

On server side : 
```php
// Add array as a JsObject.
$this->wjs->extensionAdd('JsObject', 'testObject', array(
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
$this->wjs->extensionAdd('JsArray', 'myJsArrayName', array(
  0           => 'ATest',
  1           => 'AnOtherTest',
  'keysWill'  => 123,
  'disappear' => array(0 => 'bar')
));
```
On client side : 
```javascript
// Will return : ["ATest", "AnOtherTest", 123, Array[1]]
wjs.use('JsArray', 'myJsArrayName', function (arrayContent) {
  continueYourScript(arrayContent);
});
```


Javascript code
---------------

You can easily add simple javascript code for your own usage. 

On server side : 
```php
// Add a remote file.
$this->wjs->extensionAdd('JsScript', 'testScriptFile', $filePath);
// Add an inline code.
$this->wjs->extensionAdd('JsScript', 'testScriptInline', 'window.jsScriptInlineLoaded = true;');
// Add reloadable script,
// it will increment global var at each pull, with the reload:true option.
$this->wjs->extensionAdd('JsScript', 'jsScriptReloadable', 'window.jsScriptReloadCount===undefined ? window.jsScriptReloadCount = 0 : window.jsScriptReloadCount++;');
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
$this->wjs->extensionAdd('JsMethod', 'testMethod', $path);
```
Your Js file must also be wrapped, it allows wjs to catch it :

```javascript
[FILE:projects/wjs/tests/objects/JsMethod/testMethod.js]
```

On client side : 
```javascript
// The retrieved method will return the length of an object.
var length = wjs.use('JsMethod', 'testMethod', function (reg) {
  var length;
  var method = reg.JsMethod.testMethod;
  //console.log(reg);
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


Audio loading
-------------

You can also use wjs to retrieve audio, and use it only when load complete. Images do not need to be packed on server side. 

On client side : 
```javascript
// We load an mp3 or ogg file.
wjs.use('Audio', audioUrl, {
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


Php methods
-----------

You can load PHP classical methods.

Loaders
-------

Now enter in the craziness of wjs.. You can also load loaders as extensions. It allow to load your page only with wjs and the core wjsLoader, then load every loader you need later.

On server side : 
```php
[PULL_WJSLOADER_PHP]
```
On client side : 
```javascript
// First we load loader,
// this action is also for example,
// in real life, wjs make this action
// automatically when using a script.
wjs.use('WjsLoader', 'JsArray', function (reg) {
  // Then we load script.
  wjs.use('JsArray', 'load_wjsLoader_testArray', continueCallback);
});
```
Obviously you should declare your loader into a separated javascript file. See into wjs core for more info.

Web components
--------------

The WebComp type allow to retrieve basic web components, composed by CSS, HTML, and Javascript.

Web pages
---------

The WebPage type is a subclass of WebComp, designed manage advanced pages integration and URL management. This class is used by the Website class as the default objects for page rendering.

Web forms
---------

The web form offers a server side validation system for your web components.

Web pages
---------

Libraries are linked to WebPages and contains extra required features for current loaded page. 

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

Binder
------

WebComp extended with events listeners methods.

Element
-------

Binder with more features, support plugins, children and animation playing process.

Plugin
------

Add functional improvement for elements.

Formula
-------

Used as arguments, formulas can define variable numeric values, ie : mouse position



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
$this->wjs->extensionAddRequire('JsObject', 'nameOfJsObjectWithDependencies', 'JsObject', 'nameOfJsObjectWithDependencies2');
```


Exclude dependencies
--------------------

A dangerous point with dependencies is to retrieve multiple times the same extensions. If "A" and "B" need "C" extensions, you'll probably load it two times. You can define options on your request to ask to not retrieve dependencies. It is useful to control when you know that required extensions are already loaded.

On client side : 
```javascript
// We don't want any dependency.
object = wjs.use('JsObject', 'nameOfExtensionWithDependencies', {
  exclude: true,
  complete: continueCallback
});
```

Or more precisely. On client side : 
```javascript
// We don't want multiple dependencies, but we allow others.
object = wjs.use('JsObject', 'nameOfExtensionWithDependencies', {
  // We don't want these dependencies.
  exclude: {
    JsObject: ['nameOfExtensionWithDependencies2'],
    JsArray: ['nameOfArrayWithDependencies2']
  },
  complete: continueCallback
});
```




Website management
------------------

You can manage full websites with the website class. It will configure wjs for you and play with WebPage extensions.In this case wjs must be always placed under the current working directory root in order to be able to resolve client paths to css and js files.A symlink can be used, but in this case the WESITE_ROOT variable must be defined before to load the core .inc file, as PHP always resolve symlinks, otherwise wesite will not be able to detect it itself.



Document ready
--------------

In order to wait wjs to be loaded before using it, you should wrap your scripts into the wjs.ready(callback); function. It ensure the callback to be executed after your page loading and also after wjs initialization. On client side : 
```javascript
WjsProto.ready(function(){ 
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
Copyright Romain WEEGER 2010 / 2015  
http://www.wexample.com  
  
Licensed under the MIT and GPL licenses :  
  
 - http://www.opensource.org/licenses/mit-license.php  
 - http://www.gnu.org/licenses/gpl.html

Thanks
------
I would like to thanks all people who have trusted an encouraged me, consciously or not. They are not many. Like all of my projects, this program is the result of a lot of questions, doubts, pain, but joy and love too. I sincerely hope you'll enjoy it. Thanks to Carole for her incredible Love.

