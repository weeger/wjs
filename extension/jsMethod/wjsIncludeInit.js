(function (WjsProto) {
  'use strict';
  /**
   * Create a new instance for each <div data-wjsInclude="..."> tag found
   * into the given dom object.
   * @require JsMethod > wjsIncludeScan
   */
  WjsProto.register('JsMethod', 'wjsIncludeInit', function (dom, complete) {
    var i = 0, includes = this.wjsIncludeScan(dom),
      item, split, request = {}, destinations = [];
    while (item = includes[i++]) {
      if (item.getAttribute('data-wjsInclude') && !item.getAttribute('data-wjsIncludeLoaded')) {
        item.setAttribute('data-wjsIncludeLoaded', '1');
        split = item.getAttribute('data-wjsInclude').split(':');
        request[split[0]] = request[split[0]] || [];
        request[split[0]].push(split[1]);
        destinations.push({
          dom: item,
          type: split[0],
          name: split[1]
        });
      }
    }
    // It could be already loaded by server side parsing.
    // Do not assign instance here in case of multiple loading.
    this.use(request, {complete: function () {
      var i = 0;
      while (item = destinations[i++]) {
        this.loaders[item.type].wjsInclude(item.type, item.name, item.dom);
      }
      if (complete) {
        complete();
      }
    }});
  });
}(WjsProto));
