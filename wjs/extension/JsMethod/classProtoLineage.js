(function (WjsProto) {
  'use strict';
  WjsProto.register('JsMethod', 'classProtoLineage', function (tempNameProto) {
    var lineage = [];
    if (this.classMethods[tempNameProto]) {
      while (tempNameProto) {
        lineage.unshift(this.classMethods[tempNameProto].type);
        if (this.classMethods[tempNameProto].classExtends) {
          tempNameProto = this.classMethods[tempNameProto].classExtends;
        } else {
          tempNameProto = undefined;
        }
      }
    }
    return lineage;
  });
}(WjsProto));
