(function (W) {
  'use strict';
  /**
   * Simple callbacks queue management.
   */
  W.register('JsClassStatic', 'QueueManager', {
    __construct: function () {
      this.queues = {};
      this.queuesStarted = {};
      this.wjs.queueAdd = this.queueAdd.bind(this);
      this.wjs.queueNext = this.queueNext.bind(this);
    },

    queueAdd: function (name, callback) {
      this.queues[name] = this.queues[name] || [];
      this.queues[name].push(callback);
      this.queueStart(name);

    },

    queueStart: function (name) {
      if (!this.queuesStarted[name]) {
        this.queuesStarted[name] = true;
        this.queueNext(name);
      }
    },

    queueComplete: function (name) {
      delete this.queues[name];
      delete this.queuesStarted[name];
    },

    queueNext: function (name) {
      var queues = this.queues,
        next = queues[name] && queues[name].length ?
        queues[name].shift() : false;
      if (next) {
        next();
      }
      else {
        this.queueComplete(name);
      }
    }
  });
}(W));
