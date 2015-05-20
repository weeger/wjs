(function (WjsProto) {
  'use strict';
  /**
   * Create a new instance for each <wjs-include> tag found
   * into the given dom object.
   * @require JsMethod > wjsIncludeScan
   */
  WjsProto.register('JsMethod', 'wjsIncludeInit', function (dom, complete) {
    var i = 0, includes = this.wjsIncludeScan(dom),
      item, split, request = {}, destinations = [];
    while (item = includes[i++]) {
      if (!item.getAttribute('data-loaded') && item.getAttribute('type')) {
        item.setAttribute('data-loaded', '1');
        split = item.getAttribute('type').split(':');
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
      var i = 0, options;
      while (item = destinations[i++]) {
        options = this.get(item.type, item.name);
        options.domDestination = item.dom;
        // Create instance.
        this.loaders[item.type].instance(item.name);
      }
      if (complete) {
        complete();
      }
    }});
  });
}(WjsProto));
