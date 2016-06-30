(function (W) {
  'use strict';
  var regHtmlVariable = new RegExp('(?:{|%7B){2}((?:.(?!{|%7B))*)(?:}|%7D){2}', 'g'), result;
  /**
   * Search for {{markups}} or encoded %7B%7Bmarkups%7D%7D
   * and replace it from given variables container.
   */
  W.register('JsMethod', 'stringReplaceVariables', function (string, variables) {
    // Iterates over {{variables}}
    while (result = regHtmlVariable.exec(string)) {
      string = string.substring(0, result.index) + variables[result[1]] + string.substring(result.index + result[0].length);
    }
    return string;
  });
}(W));
