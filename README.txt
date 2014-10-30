

Introduction
============

![Alt text](wjs-logo.png?raw=true "The discreet library")
Load
everything you need as an extension. Wjs is an entry point to make your
Javascript web app retrieve data from your server, via AJAX, or not. Everything
is an extension with wjs : script, image, html, etc..., and all extensions may
load dependencies. It is really lightweight and infinitely extensible by your
own application data. It makes all your components packable, and let your
clients download it only when they need. The advantage is to not load useless
data in your page, and also to not care about predicting user needs. Obviously,
it requires a minimum of configuration before.. 

Configuration
=============

After downloading and installing wjs into your library folder,
there is still three important steps required to work properly with wjs, and
various way to achieve it :

- Register content you make available to transfer

- Configure your javascript header 
- Handle ajax requests


Create a Wjs
instance
---------------------

Wjs takes one arguments defining routes for both client
and server paths.

On server side : 
```php
$wjs = new \Wjs(array(
  'server' => array(
    // Path to wjs is used by wjs to retrieve
    // core scripts and internal library.
    'wjs'   => $pathToWjsLibrary,
    // If you want to use cache, you have
    // to specify route for the local folder.
    'cache' => $yourCustomCachePath
  ),
  'client' => array(
    // This path is not required, but recommended,
    // It is for example used to generate proper based paths
    // on using the jsFiles() method.
    'wjs'          => $pathToWjsFromClientSide,
    // Response path define the URL used by AJAX
    // to retrieve extensions on your server, you
    // obviously need to handle the path on server
    // side, see bellow.
    'responsePath' => $yourCustomResponsePath
  )
));
```


Register your extensions
------------------------

Registering extensions is not pushing them to the
frontend, it just define which of them may be retrieved by client. A common
usage is to register library both for normal and AJAX responses, and define
pushed data separately for each context. You may also take a look to summaries
for more information about extension registration.

Registered data is also
depending of each loader behavior, more information on loaders specific
section.

On server side : 
```php
$wjs->extensionAdd('jsArray', 'myTestArray',
array(
  0 => 'MyItem',
));
```


Linking Javascript
------------------

Adding javascript into your html page make the connexion
between server and client environment. Due to the variation of loaders,
preloaded extensions, or platforms where wjs can be included, the files included
can change a lot from on page to another. Some tools are included into wjs to
help you to achieve this point. To start the most quickly with wjs, just put
this PHP code into your <head> :

```php
<?php print $wjs->renderHeader();
?>
```

If you want more control on the way you integrates the links, there is a
mor detailed method to use :
```php
// Retrieve list of files used by core
$files = $wjs->jsFiles();
```
This method will return js files used by core,
depending of the core version used, the loaders defined, and required.
Ex:

```php
array(
  'js/wjs.js',
  'js/loader.js',
  'js/process.js',
  'loader/jsScript/jsScript.js',
  'loader/wjsLoader/wjsLoader.js',
);
```

You can now include these links into your html page. The next point is
to init wjs. This action will unpack pushed content from PHP, and execute
startup function (see "ready" method).
On client side :

```javascript
wjs.init(<?php print $this->wjs->initPackage();
?>);
```



Handle requests
---------------

You have now connected client to server wjs instances, you have
also defined which data you allow to transfer. Great. Now, you can handle
requests from client to serve required data. Requests from wjs are made by GET
method using query string names defined into settings.
Ex:


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
// Think about
always make some verification on requested content.
if ($_GET['wjs'][0]['t'] === 'jsArray' && $_GET['wjs'][0]['n'] === 'testArray')
{
  // Manage which data to retrieve.
  $wjs->push('jsArray', 'testArray');
  // When response is ready to be sent,
  // this function will add json headers,
  // print package content, then exit.
  $wjs->response();
}
```


A simple method has been made for quickly handle client requests, but
always think about filtering data from get before to use it.
```php
// This will
return requested data from GET,
// and manage print and exit, in one time.
$wjs->extensionPushRequest($_GET['wjs']);
```




Remote loading
==============

Wjs uses loaders to retrieve data from server, and parse it.
Several loaders are included into wjs core, you can also build your own loader
type. AJAX requests are asynchronous by default, it let you integrate requests
into the flow of your scripts, but you can also prefer to load your scripts
asynchronously, and use a "complete" callback to continue your actions.

Simple
Javascript Object
------------------------

On server side : 
```php
// Add array as a jsObject.
$wjs->extensionAdd('jsObject', 'testObject', array(
  'thisIs'        => 'ATest',
  'thisIsAlso'    => 'AnOtherTest',
  'thisIsANumber' => 123,
  'thisIsAnArray' => array('foo' => 'bar')
));
```
On client side : 
```javascript
wjs.pull('jsObject',
'testObject');
```


Simple Javascript Array
-----------------------

Like objects, you can also append data as javascript
arrays. Note that array keys will be turned to indexes only if not numeric, as
JavaScript arrays do not support string indexes (otherwise use jsObjects). 

On
server side : 
```php
$wjs->extensionAdd('jsArray', 'testArray', array(
  0           => 'ATest',
  1           => 'AnOtherTest',
  'keysWill'  => 123,
  'disaperar' => array(0 => 'bar')
));
```
On client side : 
```javascript
// Will return : ["ATest",
"AnOtherTest", 123, Array[1]]
wjs.pull('jsArray', 'testArray');
```


Javascript code
---------------

You can easily add simple javascript code for your own usage.


On server side : 
```php
// Add a remote file.
$wjs->extensionAdd('jsScript', 'testScriptFile', $filePath);
// Add an inline code.
$wjs->extensionAdd('jsScript', 'testScriptInline', 'window.jsScriptInlineLoaded
= true;');
```
On client side : 
```javascript
wjs.pull('jsScript',
'testScriptFile');
console.log(window.jsScriptFileLoaded); // true
// This script will add
wjs.pull('jsScript', 'testScriptInline');
console.log(window.jsScriptInlineLoaded); // true
```


Javascript methods
------------------

You can load simple javascript methods with wjs,
asynchronously or not, and execute it in your code. Some methods are included
into wjs core, as example.

On server side : 
```php
// Add javascript method
from a file.
$wjs->extensionAdd('jsMethod', 'objectLength', $pathToWjs .
'extension/jsMethod/objectLength.js');
```
Your Js file must also be wrapped, it
allows wjs to catch it :

```javascript
(function (loader) {
  'use strict';
  // <--]
  /**
   * Return length of own properties of a given object.
   * @param {Object} object
   * @return {number}
   */
  loader.methodAdd('objectLength', function (object) {
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
var testObject = {
  'lorem': 'ipsum',
  'dolor': 'sit',
  'amet': 'poireau'
};
// We execute method directly through wjs,
var length = wjs.pull('jsMethod', 'objectLength')(testObject);
// Return 3
console.log(length);
```



Image loading
-------------

You can also use wjs to retrieve images, and use it only when
load complete. Images do not need to be packed on server side. 

On client side
: 
```javascript
// We load the HTML5 Image Logo
wjs.pull('image', 'http://www.w3.org/html/logo/downloads/HTML5_Logo_512.png', {
  complete: yourCustomCallback
});
```


Javascript links
----------------

wjs is also able to append script links into your pages.

On
client side : 
```javascript
// We load an external js.
wjs.pull('jsLink', pathToYourJsFile, {
  complete: yourCustomCallback
});
```


But also several links, if you need to add them in a specific order
On
client side : 
```javascript
// If several links are declared from an array,
// All links are loaded, in order. Each link wait for
// the previous one to be loaded.
wjs.pull('jsLink', [pathToYourJsFile, pathToYourJsFile2],
yourCustomCallback2);
```


CSS links
---------

Like .js, you can also retireve css links, as link tags. They will be
appended to your document head.

On client side : 
```javascript
// We load an
external js.
wjs.pull('cssLink', pathToYourCssFile, {
  complete: yourCustomCallback
});
```


And for multiple css. On client side : 
```javascript
// If several
links are declared from an array,
// All links are loaded, in order. Each link wait for
// the previous one to be loaded,
// wrong css links do not block the process.
wjs.pull('cssLink', [pathToYourCssFile, pathToYourCssFile2],
yourCustomCallback2);
```


Loaders
-------

Now enter in the craziness of wjs.. Now you can also load loaders as
extensions. It allow to load your page only with wjs and the core wjsLoader,
then load every loader you need later.

On server side : 
```php
// We add a
loader, this one exists in wjs core,
// so this action is just here for example.
$wjs->extensionAdd('wjsLoader', 'jsArray', $filePath);
```
On client side :

```javascript
// First we load loader,
// this action is also for example,
// in real life, wjs make this action
// automatically when pull a script.
wjs.pull('wjsLoader', 'jsArray');
// Then we load script.
wjs.pull('jsArray', 'testArray');
```
Obviously you should declare your loader
into a separated javascript file. See into wjs core for more
info.



Dependencies
------------

Defining and controlling dependencies allows you to make your
requests more efficients, by retrieving multiple extensions in one request. A
"A" extension can bring with it a "B" or a "C" one, if you defined it before
pushing your data.

Define requirement
------------------

A simple function allows you to connect an extension to
another one.

On server side : 
```php
// Extension of type jsObject >
testObject,
// will be loaded with  jsObject > testObject2 when asked.
$wjs->extensionAddRequire('jsObject', 'testObject', 'jsObject',
'testObject2');
```


Exclude dependencies
--------------------

A dangerous point with dependencies is to retrieve
multiple times the same extensions. If "A" and "B" need "C" extensions, you'll
probably load it two times. You can define options on your request to ask to not
retrieve dependencies. It is useful to control when you know that required
extensions are already loaded.

On client side : 
```javascript
// We don't want
any dependency.
object = wjs.pull('jsObject', 'testObject', {
  excludeRequire: true
});
```

Or more precisely. On client side : 
```javascript
// We don't want
multiple dependencies, but we allow others.
object = wjs.pull('jsObject', 'testObject', {
  // We don't want these dependencies.
  excludeRequire: {
    jsObject: ['testObject2'],
    jsArray: ['testArray2']
  }
});
```




Settings
--------

Various settings can be configured into wjs to let you define wjs
behavior, like used paths, query string names, etc...

- responsePath : Path
used from client to retrieve packages in AJAX.
- responseQueryExtraParam : Extra
parameters added into AJAX requests, empty by default.
- requestVariableName :
Define the name of the get variable used for remote requests.
-
requestVariableKeyType : Define the key of the array containing the type of
extension.
- requestVariableKeyName : Define the key of the array containing the
name of extension.

Document ready
--------------

To wjs to be loaded before using it, you should wrap your
scripts into the wjs.ready(callback); function. It ensure the callback to be
executed after your page loading and also after wjs initialization. On client
side : 
```javascript
w.ready(function(){ 
  console.log("Ready to pull !"); 
 
// Place here your wjs.pull() requests.
})
```


Prototyping
-----------

wJs allow you to instantiate easily classes prototype. The method
is used internally by wJs and can be reused. This method respects javascript
getters and setters declaration. 

On client side : 
```javascript
// Registers
a new class prototype.
wjs.classExtend("className",{ ... });
// Create a new
registered class instance.
var instance = (new
wjs.classProto("className"))(arguments);
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
I would like to thanks all people who have trusted an encouraged me, consciously
or not. They are not many. Like all of my projects, this program is the result
of a lot of questions, doubts, pain, but joy and love too. I sincerely hope
you'll enjoy it. Thanks to Carole for her incredible Love.

