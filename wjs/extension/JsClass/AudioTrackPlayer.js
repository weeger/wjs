/**
 * Base class for WebComp elements.
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('JsClass', 'AudioTrackPlayer', {
    classExtends: 'BasicWebComp',

    variables: {
      tracks: {},
      beatCount: 0,
      playing: false,
      playStampStart: 0,
      timeout: null
    },

    options: {
      bpm: {
        defaults: 120,
        define: function (value) {
          this.bmpSet(value);
        }
      }
    },

    init: function () {
      var self = this;
      self.wjs.window.addEventListener('focus', function () {
        self.play();
      });
      self.wjs.window.addEventListener('blur', function () {
        self.pause();
      });
    },

    /**
     * @require JsClass > AudioTrackPlayerTrack
     */
    addTrack: function (options) {
      var name = options.name;
      if (!this.tracks[name]) {
        options.player = this;
        var track = new (this.wjs.classProto('AudioTrackPlayerTrack'))(options);
        this.tracks[name] = track;
        this.trackSync(track, 0);
        track.play();
      }
      return this.tracks[name];
    },

    trackSync: function (track, tolerance) {
      var time = this.trackMeasurePosition(track) / 1000;
      if (tolerance) {
        if (Math.abs(track.audio.currentTime - time) < tolerance) {
          return;
        }
      }
      track.audio.currentTime = time;
    },

    trackMeasurePosition: function (track) {
      return (this.bpmMiliseconds * (this.beatCount % track.beatsLength));
    },

    removeTrack: function (track) {
      delete this.tracks[track.name];
    },

    play: function () {
      if (!this.playing) {
        this.playing = true;
        this.beatCount = 0;
        this.playStampStart = (new Date()).getTime();
        this.playBeat();
        this.hook('play');
      }
    },

    pause: function () {
      this.playing = false;
      this.wjs.window.clearTimeout(this.timeout);
      this.hook('pause');
    },

    stop: function () {
      this.pause();
      this.hook('replay');
    },

    bmpSet: function (bpm) {
      this.bpm = bpm;
      this.bpmMiliseconds = (60 / this.bpm * 1000);
    },

    playBeat: function () {
      var i = 0, track, keys = Object.keys(this.tracks), barNumber = 0;
      while (track = this.tracks[keys[i++]]) {
        barNumber = (this.beatCount % track.beatsLength);
        if (barNumber === 0) {
          if (track.looped) {
            track.replay();
          }
        }
        else if (barNumber % 4 === 0) {
          this.trackSync(track);
        }
        else {
          this.trackSync(track, 0.1);
        }
      }
      this.beatCount++;

      this.timeout = this.wjs.window.setTimeout(this.playBeat.bind(this),
        // Compute the next stamp, using start stamp
        // and current music speed, it is much more average
        // than using a static value.
        (this.playStampStart + (this.beatCount * this.bpmMiliseconds)) -
          // Remove current value.
          new Date().getTime());
    },

    hook: function (method) {
      var i = 0, track, keys = Object.keys(this.tracks);
      while (track = this.tracks[keys[i++]]) {
        track[method]();
      }
    }
  });
}(WjsProto));
