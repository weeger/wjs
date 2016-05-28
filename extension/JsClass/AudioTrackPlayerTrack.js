/**
 * Base class for WebComp elements.
 */
(function (W) {
  'use strict';
  W.register('JsClass', 'AudioTrackPlayerTrack', {
    classExtends: 'BasicWebComp',

    options: {
      name: 'undefined',
      audio: null,
      beatsLength: 1,
      player: null,
      volume: 1,
      looped: {
        defaults: false
      }
    },

    init: function () {
      this.audio.volume = this.volume;
    },

    play: function () {
      this.audio.play();
    },

    replay: function () {
      this.audio.currentTime = 0;
    },

    pause: function () {
      this.audio.pause();
    },

    /**
     * @require JsMethod > animate
     */
    fade: function (duration, to, complete) {
      var options = {duration: duration};
      if (complete) {
        options.complete = complete;
      }
      if (this.fadeController) {
        this.fadeController.stop();
      }
      this.fadeController = this.wjs.animate(this.audio, {volume: to}, options)
    },

    fadeSync: function (to, complete) {
      this.fade(
        // Rounding prevent bug on volume assignation.
        Math.floor((this.player.bpmMiliseconds * this.beatsLength) - this.player.trackMeasurePosition(this)),
        to, complete);
    }
  });
}(W));
