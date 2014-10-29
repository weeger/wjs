Introduction
============

![Alt text](wjs-logo.png?raw=true "The discreet library")
Load everything you need as an extension. Wjs is an entry point to make your Javascript web app retrieve data from your server, via AJAX, or not. Everything is an extension with wjs : script, image, html, etc..., and all extensions may load dependencies. It is really lightweight and infinitely extensible by your own application data. It makes all your components packable, and let your clients download it only when they need. The advantage is to not load useless data in your page, and also to not care about predicting user needs. Obviously, it requires a minimum of configuration before.. 

Configuration
=============

After downloading and installing wjs into your library folder, there is still three important steps required to work properly with wjs, and various way to achieve it :

- Register content you make available to transfer 
- Configure your javascript header 
- Handle ajax requests


Create a Wjs instance
---------------------

Wjs takes one arguments defining routes for both client and server paths.

On server side : 
```php
[CONF_WJS_INSTANCE]
```


Register your extensions
------------------------

Registering extensions is not pushing them to the frontend, it just define which of them may be retrieved by client. A common usage is to register library both for normal and AJAX responses, and define pushed data separately for each context. You may also take a look to summaries for more information about extension registration.

Registered data is also depending of each loader behavior, more information on loaders specific section.

On server side : 
```php
[CONF_EXT_ADD]
```


Linking Javascript
------------------

Adding javascript into your html page make the connexion between server and client environment. Due to the variation of loaders, preloaded extensions, or platforms where wjs can be included, the files included can change a lot from on page to another. Some tools are included into wjs to help you to achieve this point. To start the most quickly with wjs, just put this PHP code into your <head> :

```php
[INIT_WJS_QUICK]
```

If you want more control on the way you integrates the links, there is a mor detailed method to use :
```php
[PULL_INIT_JS_FILES_PHP]
```
This method will return js files used by core, depending of the core version used, the loaders defined, and required. Ex:

```php
[PULL_INIT_JS_FILES_PHP_RETURN]
```

You can now include these links into your html page. The next point is to init wjs. This action will unpack pushed content from PHP, and execute startup function (see "ready" method).
On client side : 
```javascript
[PULL_INIT_JS_FILES_JS_INIT]
```



Handle requests
---------------

You have now connected client to server wjs instances, you have also defined which data you allow to transfer. Great. Now, you can handle requests from client to serve required data. Requests from wjs are made by GET method using query string names defined into settings. Ex:


```php
[REQUEST_CONTENT]
```

So you can filter and manage returned content.
```php
[REQUEST_CONTENT_PUSH]
```


A simple method has been made for quickly handle client requests, but always think about filtering data from get before to use it.
```php
[HANDLE_REMOTE_REQUEST]
```




Remote loading
==============

Wjs uses loaders to retrieve data from server, and parse it. Several loaders are included into wjs core, you can also build your own loader type. AJAX requests are asynchronous by default, it let you integrate requests into the flow of your scripts, but you can also prefer to load your scripts asynchronously, and use a "complete" callback to continue your actions.

Simple Javascript Object
------------------------

On server side : 
```php
[PULL_JSOBJECT_PHP]
```
On client side : 
```javascript
[PULL_JSOBJECT_JS]
```


Simple Javascript Array
-----------------------

Like objects, you can also append data as javascript arrays. Note that array keys will be turned to indexes only if not numeric, as JavaScript arrays do not support string indexes (otherwise use jsObjects). 

On server side : 
```php
[PULL_JSARRAY_PHP]
```
On client side : 
```javascript
[PULL_JSARRAY_JS]
```


Javascript code
---------------

You can easily add simple javascript code for your own usage. 

On server side : 
```php
[PULL_JSSCRIPT_PHP]
```
On client side : 
```javascript
[PULL_JSSCRIPT_JS]
```


Javascript methods
------------------

You can load simple javascript methods with wjs, asynchronously or not, and execute it in your code. Some methods are included into wjs core, as example.

On server side : 
```php
[PULL_JSMETHOD_PHP]
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
[PULL_JSMETHOD_JS]
```



Image loading
-------------

You can also use wjs to retrieve images, and use it only when load complete. Images do not need to be packed on server side. 

On client side : 
```javascript
[PULL_IMAGE]
```


Loaders
-------

Now enter in the craziness of wjs.. Now you can also load loaders as extensions. It allow to load your page only with wjs and the core wjsLoader, then load every loader you need later.

On server side : 
```php
[PULL_WJSLOADER_PHP]
```
On client side : 
```javascript
[PULL_WJSLOADER_JS]
```
Obviously you should declare your loader into a separated javascript file. See into wjs core for more info.



Settings
--------

Various settings can be configured into wjs to let you define wjs behavior, like used paths, query string names, etc...

- responsePath : Path used from client to retrieve packages in AJAX.
- responseQueryExtraParam : Extra parameters added into AJAX requests, empty by default.
- requestVariableName : Define the name of the get variable used for remote requests.
- requestVariableKeyType : Define the key of the array containing the type of extension.
- requestVariableKeyName : Define the key of the array containing the name of extension.

Document ready
--------------

To wjs to be loaded before using it, you should wrap your scripts into the wjs.ready(callback); function. It ensure the callback to be executed after your page loading and also after wjs initialization. On client side : 
```javascript
w.ready(function(){ 
  console.log("Ready to pull !"); 
  // Place here your wjs.pull() requests.
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
