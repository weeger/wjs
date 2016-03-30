(function (WjsProto) {
  'use strict';
  /**
   */
  WjsProto.register('JsMethod', 'domTextWrapLetter', function (dom, tagName) {
    tagName = tagName || 'span';
    var text = dom.innerHTML, output = [], i = 0, letter, domWrapper, domLetter;

    dom.innerHTML = '';

    while (letter = text[i++]) {
      // Create main wrapper.
      domWrapper = this.document.createElement(tagName);
      domWrapper.className = 'wrapper';
      // Adjust style to keep text style design.
      domWrapper.style.display = 'inline-block';
      domWrapper.style.verticalAlign = 'top';
      // Create another wrapper for letter only.
      domLetter = this.document.createElement(tagName);
      domLetter.className = 'letter';
      // Use a display block to allow margin animations.
      domLetter.style.display = 'block';
      domLetter.style.float = 'left';
      // Add letter.
      domLetter.innerHTML = letter !== ' ' ? letter : '&nbsp;';
      // Append.
      domWrapper.appendChild(domLetter);
      dom.appendChild(domWrapper);
      // Save list of second level dom nodes.
      output.push(domLetter);
    }

    return output;
  });
}(WjsProto));
