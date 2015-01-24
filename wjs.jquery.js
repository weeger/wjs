(function(p){(function(g){var n;if(void 0===g.wjs||"[$version]"!==g.wjs.version)n=function(){this.extendObject(this,{context:g,window:g.window||window,document:g.document||window.document,version:"[$version]",readyCallbacks:[],readyComplete:!1,packageDefault:null,loaders:{},loadersExtra:[],loadersBasic:[],extLoaded:{WjsLoader:{}},extRequire:{},processProto:null,processes:[],processCounter:0,processStack:[],processParent:void 0,classProtos:{},classMethods:{},cacheBuffer:{},cacheReg:{},settings:null});
this.context.wjsContext=g},n.prototype={init:function(a){var b=this;b.window.addEventListener("load",function(){b.extendObject(b,a);for(var c=0;c<b.loadersBasic.length;c++)b.loaderAdd(b.loadersBasic[c],void 0,!0);b.readyComplete=!0;(new b.processProto(null,{complete:function(){delete b.packageDefault;b.callbacks(b.readyCallbacks)}})).responseParse(b.packageDefault)})},ready:function(a){!0===this.readyComplete?this.window.setTimeout(function(){a()}):this.readyCallbacks.push(a)},readyDelay:function(a,
b){var c=this;return!0!==c.readyComplete?(c.ready(function(){c[a].apply(c,b)}),!0):!1},callbacks:function(a,b){for(var c=0;c<a.length;c++)a[c].apply(this,b)},urlToken:function(a){return this.settings.cacheToken?(a=-1===a.indexOf("?")?a+"?":a,a+"&"+this.settings.cacheToken):a},loaderAdd:function(a,b,c){b=b||{};if(!this.loaders[a]){var d="WjsLoader"+a;b.type=a;b.classExtends=b.classExtends||"WjsLoader";this.classExtend(d,b);this.loaders[a]=new (this.classProto(d))(a);this.extRequire[a]={};this.extLoaded[a]=
this.extLoaded[a]||{};c&&(this.extLoaded.WjsLoader[a]=b)}},loadersExists:function(a,b){for(var c=0,d=[];c<a.length;c++)this.loaders[a[c]]||d.push(a[c]);return 0<d.length?new this.processProto({WjsLoader:d},{stacked:!1,complete:b}):b()},processFor:function(a,b){for(var c=0,d,c=0;c<this.processes.length;c++)for(d=0;d<this.processes[c].extRequests.length;d++)if(this.processes[c].extRequests[d].type===a&&this.processes[c].extRequests[d].name===b)return this.processes[c]},use:function(a,b){if(!this.readyDelay("use",
arguments)){if("string"===typeof a){var c={};c[a]=[b];b=arguments[2];a=c}return new this.processProto(a,b)}},get:function(a,b){var c=this.extLoaded[a];return c&&c.hasOwnProperty(b)?c[b]:!1},destroy:function(a,b,c){var d=this,e={};if(!this.readyDelay("destroy",arguments))if(e[a]=[b],c&&c.async)delete c.async,d.window.setTimeout(function(){d.destroy(a,b,c)});else return c="boolean"===typeof c?{dependencies:c}:c,c=d.extendOptions(c,{destroy:!0}),new d.processProto(e,c)},destroyRequest:function(a,b,c,
d){var e=this;if("WjsLoader"!==b||"WjsLoader"!==c&&"JsLink"!==c&&-1===e.loadersBasic.indexOf(c)){var f=e.extRequire[b]?e.extRequire[b][c]:null,m=b+"::"+c,k=e.cacheReg[m];a[b]=a[b]||[];a[b].push(c);k&&(e.destroyRequest(a,"CacheLink",k,d),delete e.cacheReg[m]);f&&d.dependencies&&e.regEach(f,function(f,k){e.requireShared(b,c,f,k,a)||e.destroyRequest(a,f,k,d)})}},requireShared:function(a,b,c,d,e){var f=this,m=!1;f.regEach(f.extRequire,function(k,l){var h=f.extRequire[k][l];if(k!==a&&l!==b&&h[c]&&!(-1===
h[c].indexOf(d)||e&&e[k]&&-1!==e[k].indexOf(l)))return m=!0,!1});return m},regEach:function(a,b){for(var c=0,d,e=Object.keys(a),f;c<e.length;c++)for(f=Array.isArray(a[e[c]])?a[e[c]]:Object.keys(a[e[c]]),d=0;d<f.length;d++)if(!1===b.call(this,e[c],f[d]))return!1;return!0},regRem:function(a,b,c){delete a[b][c];this.objectIsEmpty(a[b])&&delete a[b]},regNext:function(a){var b=Object.keys(a)[0],c;return b&&(c=Object.keys(a[b])[0])?{type:b,name:c,data:a[b][c]}:!1},ajax:function(a){a.method=a.method||"GET";
a.async=a.async||!1;var b=new this.window.XMLHttpRequest;b.open(a.method,a.url,a.async);b.onreadystatechange=function(){4===b.readyState&&(200===b.status?a.success&&"function"===typeof a.success&&a.success(b):a.error(b))};"POST"===a.method&&b.setRequestHeader("Content-type","application/x-www-form-urlencoded");b.send(a.data?this.param(a.data):void 0)},param:function(a){var b,c=[],d=Object.keys(a);for(b=0;b<d.length;b++)c.push(d[b]+"="+a[d[b]]);return c.join("&")},extendObject:function(a,b,c){for(var d=
0,e=Object.keys(b),f;d<e.length;d++)f=e[d],c&&"object"===typeof b[f]?(a[f]=a[f]||{},this.extendObject(a[f],b[f])):a[f]=b[f];return a},extendOptions:function(a,b){a?"function"===typeof a&&(a={complete:a}):a={};return b?this.extendObject(a,this.extendOptions(b)):a},extendProto:function(a,b){var c,d=Object.keys(b);for(c=0;c<d.length;c++)Object.defineProperty(a,d[c],Object.getOwnPropertyDescriptor(b,d[c]));return a},objectIsEmpty:function(a){for(var b in a)if(a.hasOwnProperty(b))return!1;return!0},classExtend:function(a,
b){this.classMethods[a]?this.extendProto(this.classMethods[a],b):this.classMethods[a]=b},classProto:function(a){if(!this.classProtos[a]){var b,c=Object;(b=(b=this.classMethods[a])&&b.classExtends?b.classExtends:!1)&&(c=this.classProto(b));b=this.classProtos[a]=function(){return this.__construct?this.__construct.apply(this,arguments):null};b.prototype=Object.create(c.prototype);this.extendObject(b.prototype,{constructor:c,className:a,wjs:this})}this.classMethods[a]&&this.extendProto(this.classProtos[a].prototype,
this.classMethods[a]);return this.classProtos[a]},classProtoDestroy:function(a){this.classProtos[a]&&delete this.classProtos[a];this.classMethods[a]&&delete this.classMethods[a]},cacheHandle:function(a,b,c){var d=this.loaders[a].cacheHandler[b],e=this.cacheBuffer;d?d.cacheHandle(a,b,c):(e[a]=e[a]||{},e[a][b]=c)},onload:function(a,b){var c=!1,d=function(){c=!0;a.removeEventListener("load",d);b()};a.addEventListener("load",d);this.window.setTimeout(function(){c||b()},200)},err:function(a,b){if(!b&&
this.window.console)this.window.console.error("[wjs error] : "+a);else throw new this.window.Error("[wjs error] : "+a);}},g["wjs-[$version]"]=new n,g.wjs||(g.wjs=g["wjs-[$version]"]),g.wjs.classExtend("WjsLoader",{type:"",preventReload:!0,processType:"server",__construct:function(){this.cacheHandler={}},__destruct:function(){},init:function(){},parse:function(a,b,c){return b},link:function(a){this.wjs.use(this.type,a)},destroy:function(a,b){return!0},extRequestUse:function(a,b){return{mode:this.processType,
type:this.type,name:a}},extRequestDestroy:function(a,b){return{mode:"parse",type:this.type,name:a}}}),n=function(a,b){var c=this,d=g.wjs;b=d.extendOptions(b||{});!b.processParent&&d.processParent&&(b.processParent=d.processParent);d.extendObject(c,{id:d.processCounter++,wjs:d,destroy:b.destroy||!1,booted:!1,parseQ:{},async:b.async||!1,callbacks:b.complete?[b.complete]:[],extRequests:[],exclude:b.exclude,stacked:void 0!==b.stacked?b.stacked:!0,request:a,options:b,next:[],processStack:[],output:{}});
c.wjs.processes.push(c);a&&d.loadersExists(Object.keys(a),function(){c.boot()})},n.prototype={boot:function(){var a=this,b=a.wjs,c=a.request,d={},e,f="extRequest"+(a.destroy?"Destroy":"Use"),m={};if(!0!==a.booted){a.booted=!0;if(a.stacked&&(e=a.options.processParent?a.options.processParent.processStack:a.wjs.processStack,-1===e.indexOf(this)&&e.push(this),0!==e.indexOf(this))){a.booted=!1;return}a.destroy&&(b.regEach(c,function(c,e){b.destroyRequest(d,c,e,a.options)}),c=d);b.regEach(c,function(c,
d){var e=b.processFor(c,d);if(e&&e!==a)return e.next.push(a),!1})?b.regEach(c,function(d,e){var h,g;(h=b.get(d,e))&&a.options.reload&&(h=!1,delete b.extLoaded[d][e],b.cacheReg[d+"::"+e]&&delete b.extLoaded.CacheLink[b.cacheReg[d+"::"+e]]);if(h&&!1===a.destroy)a.output[d]=a.output[d]||{},a.output[d][e]=h;else if(b.loaders[d]){for(h=0;h<b.processes.length;h++)if(g=b.processes[h],g.destroy===a.destroy&&g.parseQ[d]&&g.parseQ[d][e])return a.booted=!1,a.loadingComplete(!0),g.itemParse(d,e,function(){return b.use(c,
a.options)}),!1;a.extRequests.push(b.loaders[d][f](e,a))}else m[d]=m[d]||{},m[d][e]={"#data":"WJS_ERR_PULL_UNDEFINED_LOADER"},a.wjs.err("Load error for WJS_ERR_PULL_UNDEFINED_LOADER")})&&a.loadingStart(m):a.booted=!1}},loadingStart:function(a){var b,c,d,e=this,f=e.wjs,g=e.extRequests,k,l=f.settings,h={};a=a||{};for(b=0;b<g.length;b++)switch(k=g[b],c=k.type,d=k.name,k.mode){case "server":c=l.paramInc+"["+c+"]";h[c]=h[c]?h[c]+","+d:d;break;case "parse":a[c]=a[c]||{},a[c][d]={"#data":k.data}}if(f.objectIsEmpty(h))e.responseParse(a);
else{if(e.exclude)if(!0===e.exclude)h[l.paramExc]="1";else for(c=Object.keys(e.exclude),b=0;b<c.length;b++)h[l.paramExc+"["+c[b]+"]"]=e.exclude[c[b]].join(",");l.cacheToken&&(h[l.paramToken]=l.cacheToken);f.ajax({url:l.responsePath+"?"+f.param(h)+l.paramExtra,method:"GET",async:e.async,success:function(b){f.extendObject(a,JSON.parse(b.responseText),!0);e.responseParse(a)}})}},loadingComplete:function(a){var b=this.wjs,c=0,c=b.processParent,d;b.processes.splice(b.processes.indexOf(this),1);a||(b.processParent=
this,b.callbacks(this.callbacks,[this.output,this]),b.processParent=c);Object.freeze(this);if(this.stacked&&-1!==d&&(b=this.options.processParent?this.options.processParent.processStack:this.wjs.processStack,d=d=b.indexOf(this),-1!==d&&(b.splice(b.indexOf(this),1),!a)))for(c=0;c<b.length;c++)b[c].boot();for(c=0;c<this.next.length;c++)this.next[c].boot()},responseParse:function(a){var b=this;b.wjs.extendObject(b.parseQ,a,!0);b.wjs.loadersExists(Object.keys(b.parseQ),function(){b.responseParseNext()})},
responseParseNext:function(){var a=this.wjs,b,c=this.parseQ;this.destroy&&c.WjsLoader&&1<Object.keys(c).length&&(c=a.extendObject({},c,!0),delete c.WjsLoader);for(;b=a.regNext(c);){if(this.destroy){this.itemDestroy(b.type,b.name);return}if(!a.get(b.type,b.name)){this.itemParse(b.type,b.name);return}a.regRem(c,b.type,b.name)}0<Object.keys(c).length&&this.wjs.err("Parse queue not empty.");this.loadingComplete()},itemParse:function(a,b,c){var d=this,e=d.wjs,f=d.parseQ[a][b];c&&(f["#callbacks"]=f["#callbacks"]||
[],f["#callbacks"].push(c));if(void 0!==f["#require"]&&(e.extRequire[a][b]=e.extRequire[a][b]||{},e.extendObject(e.extRequire[a][b],f["#require"]),d.requireMissing(f["#require"]))){c=f["#require"];f["#require"]=void 0;e.use(c,{stacked:!1,complete:function(){d.itemParse(a,b)}});return}"string"===typeof f["#data"]&&0===f["#data"].indexOf("cache://")?(e.cacheReg[a+"::"+b]=f["#data"].split("://")[1],e.cacheBuffer[a]&&e.cacheBuffer[a][b]?d.cacheHandle(a,b,e.cacheBuffer[a][b]):e.loaders[a].cacheHandler[b]=
d):d.cacheHandle(a,b,f["#data"])},cacheHandle:function(a,b,c){var d=this.wjs,e=d.loaders[a],f=d.cacheBuffer[a],g=e?e.cacheHandler:!1;"string"===typeof c&&0===c.indexOf("WJS_ERR_")?(d.err("Parse error for "+a+"::"+b+" : "+c),c=new d.window.Error(c)):c=e.parse(b,c,this);g[b]&&delete g[b];f&&f[b]&&(delete f[b],d.objectIsEmpty(f)&&delete d.cacheBuffer[a]);!1!==c&&this.itemParseComplete(a,b,c)},itemParseComplete:function(a,b,c){var d=this.parseQ[a][b]["#callbacks"];this.wjs.extLoaded[a]&&(this.wjs.extLoaded[a][b]=
c,this.output[a]=this.output[a]||[],this.output[a][b]=c);this.wjs.regRem(this.parseQ,a,b);d?this.wjs.callbacks(d):this.responseParseNext()},itemDestroy:function(a,b){var c=this.wjs,d=this.wjs.get(a,b);c.loaders[a]&&!1!==d&&!1===c.loaders[a].destroy(b,d,this)||this.itemDestroyComplete(a,b)},itemDestroyComplete:function(a,b){var c=this.wjs;c.regRem(this.parseQ,a,b);this.wjs.loaders[a]&&(delete c.extLoaded[a][b],delete c.extRequire[a][b]);this.responseParseNext()},requireMissing:function(a){var b=this.wjs,
c=!1;b.regEach(a,function(a,e){if(!1===b.get(a,e))return c=!0,!1});return c}},g.wjs.processProto=n,g.wjs.loaderAdd("JsLink",{processType:"parse",destroy:function(a,b){b.parentNode.removeChild(b);return!0},parse:function(a,b,c){var d=this.type,e=this.wjs.document.createElement("script");b=this.wjs.urlToken(b||a);if(!(b instanceof this.wjs.window.Error))return this.wjs.onload(e,function(){c.itemParseComplete(d,a,e)}),e.setAttribute("src",b),this.wjs.document.head.appendChild(e),!1}},!0),g.wjs.loaderAdd("WjsLoader",
{classExtends:"WjsLoaderJsLink",processType:"server",destroy:function(a){var b=this.wjs;b.loaders[a]&&(b.loaders[a].__destruct(),b.classProtoDestroy("WjsLoader"+a),delete b.loaders[a],delete b.extLoaded[a],delete b.extRequire[a]);return!0},parse:function(a,b,c){if(!0===b)this.wjs.loaderAdd(a);else return this.wjs.loaders.JsLink.parse.apply(this,[a,b,c])}},!0)})(p)})(jQuery);
