(function (WjsProto) {
  'use strict';
  /**
   * @require JsMethod > wjsIncludeGet
   */
  WjsProto.register('JsMethod', 'wjsIncludeTag', function (dom, complete) {
    var i = 0, includes = this.wjsIncludeGet(dom),
      item, split, request = {}, destinations = [];
    while (item = includes[i++]) {
      if (!item.getAttribute('data-loaded')) {
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
    // It could be already loaded by
    // server side parsing.
    this.use(request, function () {
      for (var i = 0; item = destinations[i++];) {
        // Mark item as loaded
        this.loaders[item.type].include(item.name, item.dom);
      }
      if (complete) {
        complete();
      }
    });
  });
}(WjsProto));
