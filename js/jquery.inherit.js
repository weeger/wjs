/**
 * Inheritance plugin
 *
 * Copyright (c) 2010 Filatov Dmitry (dfilatov@yandex-team.ru)
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 * @version 1.3.5
 */(function(e){function a(n,r,s){var o=!1;if(i){var a=[];e.each(u,function(){s.hasOwnProperty(this)&&(o=!0)&&a.push({name:this,val:s[this]})}),o&&(e.each(s,function(e){a.push({name:e,val:this})}),s=a)}e.each(s,function(i,s){o&&(i=s.name,s=s.val);if(e.isFunction(s)&&(!t||s.toString().indexOf(".__base")>-1)){var u=n[i]||function(){};r[i]=function(){var e=this.__base;this.__base=u;var t=s.apply(this,arguments);return this.__base=e,t}}else r[i]=s})}var t=function(){_}.toString().indexOf("_")>-1,n=function(){},r=Object.create||function(e){var t=function(){};return t.prototype=e,new t},i=!0,s={toString:""};for(var o in s)s.hasOwnProperty(o)&&(i=!1);var u=i?["toString","valueOf"]:null;e.inherit=function(){var t=arguments,i=e.isFunction(t[0]),s=i?t[0]:n,o=t[i?1:0]||{},u=t[i?2:1],f=o.__constructor||i&&s.prototype.__constructor?function(){return this.__constructor.apply(this,arguments)}:function(){};if(!i)return f.prototype=o,f.prototype.__self=f.prototype.constructor=f,e.extend(f,u);e.extend(f,s);var l=s.prototype,c=f.prototype=r(l);return c.__self=c.constructor=f,a(l,c,o),u&&a(s,f,u),f},e.inheritSelf=function(e,t,n){var r=e.prototype;return a(r,r,t),n&&a(e,e,n),e}})(jQuery);