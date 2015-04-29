(function (WjsProto) {
  'use strict';
  // Create regex once.
  var regex = new RegExp('^[a-zA-Z0-9]*\\[([a-zA-Z0-9]*)\\]$'),
    regexNum = new RegExp('^([0-9])*$');
  /**
   * Convert a query string to a key / value object.
   */
  WjsProto.register('JsMethod', 'urlQueryParse', function (search) {
    var output = {}, i, split, key, value, match;
    // If not specified, take the current search
    // value without leading "?".
    search = search || this.document.location.search.substr(1);
    search = search.split('&');
    for (i = 0; i < search.length; i++) {
      split = decodeURIComponent(search[i]).split('=');
      // Prevent to parse non key / value pair,
      // or empty strings.
      if (split.length === 2) {
        key = split[0];
        value = split[1];
        match = key.match(regex);
        if (match) {
          // Get key without brackets.
          key = key.split('[')[0];
          // Index is a number, we save as an array.
          if (match[1].match(regexNum) && (!output[key] || Array.isArray(output[key]))) {
            // Create entry
            output[key] = output[key] || [];
          }
          // Index is a string, we save into an object.
          else {
            // If an query string starts with numerical indexes
            // then get one string index, it can create an error.
            output[key] = output[key] || {};
          }
          output[key][match[1]] = value;
        }
        else {
          output[split[0]] = split[1];
        }
      }
    }
    return output;
  });
}(WjsProto));
