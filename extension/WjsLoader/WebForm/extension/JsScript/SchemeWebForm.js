/**
 * Base class for WebCom elements.
 * @require JsScript > SchemeWebCom
 */
(function (W) {
  'use strict';
  W.register('WebComScheme', 'SchemeWebForm', {
    classExtends: 'WebCom',

    options: {

      form: {
        defaults: null,
        define: function (com, value, options) {
          // We need html and dom.
          com.optionApply('html', options);
          // We let user to define custom form.
          var form = value || com.dom.querySelector('form');
          // Bind callback to allow remove.
          com.formSubmitBind = com.formSubmit.bind(com);
          // Listen.
          form.addEventListener('submit', com.formSubmitBind);
          // Save.
          return form;
        },
        destroy: function (com) {
          // Remove callback from dom.
          com.form.removeEventListener('submit', com.formSubmitBind);
        }
      },
      formId: {
        defaults: null,
        define: function (com, value, options) {
          com.optionApply('form', options);
          var domFormId = this.w.document.createElement('input');
          // Append id for submission.
          domFormId.setAttribute('name', 'formId');
          domFormId.setAttribute('type', 'hidden');
          // ID has been created by server.
          domFormId.value = value;
          com.form.appendChild(domFormId);
        }
      }
    },

    __construct: function () {
      // Web com constructor.
      this.__super('__construct', arguments);
      // Shorthand.
      this.initWebForm();
    },

    __destruct: function () {
      // Shorthand.
      this.exitWebForm();
      // Base.
      this.__super('__destruct', arguments);
    },

    // To override...
    initWebForm: W._e,

    // To override...
    exitWebForm: W._e,

    formSubmit: function (e) {
      // Stop submission.
      e.preventDefault();
      // Build data to send.
      var i = 0, key, elements = this.form.elements,
        keys = Object.keys(elements), data = {};
      while (key = keys[i++]) {
        // Ignore numeric keys.
        if (isNaN(key) && key !== 'length') {
          data[key] = elements[key].value;
        }
      }
      if (this.submit(data)) {
        // Send.
        this.w.ajax({
          method: 'POST',
          data: data,
          url: this.w.settings.pathResponse + '?' + this.loader.type + '=1',
          success: this.success.bind(this)
        });
        // Let form do action before receiving response.
        this.sent(data);
      }
    },

    // To override...
    submit: W._e,

    // To override...
    sent: W._e,

    // To override...
    success: W._e
  });
}(W));
