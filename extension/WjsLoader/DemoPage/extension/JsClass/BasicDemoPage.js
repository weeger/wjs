/**
 * Base class for WebComp elements.
 * @require JsClass > AudioTrackPlayer
 */
(function (WjsProto) {
  'use strict';
  WjsProto.register('JsClass', 'BasicDemoPage', {
    classExtends: 'BasicWebPage',
    type: 'BasicDemoPage',

    variables: {
      cssClasses: [
        'BasicDemoPage'
      ],
      audioBpm: 150,
      audioTrack: null
    },

    optionsDefault: {
      domDestination: '#main-page-body'
    },

    options: {
      /*audioFile: {
        defaults: false,
        define: function (value) {
          var self = this, wjs = self.wjs, previous = self.loader.audioTrackPrevious;
          if (previous) {
            previous.fadeSync(0, function () {
              self.wjs.demoAudioPlayer.removeTrack(previous);
              delete self.loader.audioTrackPrevious;
            });
          }

          if (value) {
            // Then load audio separately.
            wjs.use('Audio', value, function () {
              // Check if sound player exists.
              if (!wjs.demoAudioPlayer) {
                // Create it if missing.
                wjs.demoAudioPlayer = new (wjs.classProto('AudioTrackPlayer'))({
                  bpm: self.audioBpm
                });
              }
              var audio = wjs.get('Audio', value), audioTrack;
              audio.volume = 0;
              audioTrack = wjs.demoAudioPlayer.addTrack(value, audio, 32);
              audioTrack.audio.volume = 0;
              audioTrack.fadeSync(1);
              audioTrack.play();
              wjs.window.setTimeout(function () {
                wjs.demoAudioPlayer.trackSync(audioTrack);
              });
              // Play if not already started.
              wjs.demoAudioPlayer.play();
              self.audioTrack = audioTrack;
            });
          }
        },
        destroy: function () {
          if (this.audioTrack) {
            this.loader.audioTrackPrevious = this.audioTrack;
          }
        }
      }*/
    }
  });
}(WjsProto));
