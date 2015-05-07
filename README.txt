Introduction
============

This site template has been offer you a original navigation and user experience.
It uses latest HTML5 and CSS3 features to promote your content gracefully.

This site have been build around the wjs technology using the lazy page load system.
Consequently, pages and components are placed into separated folders and are
easy to modify. New pages folders will be automatically detected.

All the code is commented to help you to modify the site behavior. The wjs library
is an open source PHP / Javascript library, available on https://github.com/weeger/wjs


Requirements
============

This site templates require a recent LAMP server to run with PHP 5.3 or higher.
It runs on recent major browsers.


Install
=======

- Unzip the site into your web root.
- Ensure that cache folder have proper write permission (755)
- Enjoy


Configuration
=============

- The common page template is placed into root files
  * index.php : HTML tags
  * styles.css : Common styles
  * script.js : Common javascript

- The other components are placed into the "extensions" folder.
  * extensions/DemoPage : Contains site's pages
  * extensions/WebComp : Contains other components like menus.

- Advanced users can also edit the config.inc file which is
  fully commented.
  * Change the cacheToken variable to flush the site cache.

- A custom "loader" manage the pages transitions
  into extensions/WjsLoader/DemoPage

- Get more information about the usage of wjs library on
  https://github.com/weeger/wjs


Thanks
======

More information of my works on http://www.wexample.com
