(function (W) {
  'use strict';
  /**
   * Create a new instance for each <div data-wjsInclude="..."> tag found
   * into the given dom object.
   * @require JsMethod > wjsIncludeScan
   */
  W.register('JsMethod', 'wjsIncludeInit', function (dom, options, complete) {
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
          name: split[1],
          options: this.extendObject({}, options)
        });
      }
    }
    if (Object.keys(request).length) {
      // It could be already loaded by server side parsing.
      // Do not assign instance here in case of multiple loading.
      this.use(request, function () {
        var i = 0;
        while (item = destinations[i++]) {
          this.loaders[item.type].wjsInclude(item.type, item.name, item.dom, item.options);
        }
        if (complete) {
          complete();
        }
      });
    }
    else if (complete) {
      complete();
    }
    return includes;
  });
}(W));
