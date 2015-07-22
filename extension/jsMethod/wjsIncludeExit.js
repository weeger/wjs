(function (WjsProto) {
  'use strict';
  /**
   * @require JsMethod > isDomNode
   * @require JsMethod > wjsIncludeScan
   * @require JsMethod > webComExit
   */
  WjsProto.register('JsMethod', 'wjsIncludeExit', function (dom, callback, queued, keep) {
    var i = 0, includes = this.isDomNode(dom) ? this.wjsIncludeScan(dom) : dom, destroyQueue = [], type,
      item, split;
    while (item = includes[i++]) {
      type = item.getAttribute('data-wjsInclude');
      split = type.split(':');
      // Avoid exclusions
      if (!keep || !keep[type]) {
        // Include tag is just a container
        // we search for first item.
        item = this.loaders.WebCom.webComList[item.getAttribute('id')];
        destroyQueue.push(item);
      }
    }
    this.webComExit(destroyQueue, callback, queued);
  });
}(WjsProto));
