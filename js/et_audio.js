var ETaudio = {
    sWaveform: '#waveform',
    sZoomSlider: '#audiocontrol .zoomslider',
    sPlayPause: '#audiocontrol .play',
    sPlayJump: '#audiocontrol .back',
    sWaveColor: 'red',
    sWaveProgressColor: 'purple',
    
    sUrlSuffix: '',
    oWavesurfer: null,
    
    init: function() {
        if(typeof(WaveSurfer) === 'undefined') {
            console.error('Required library "WaveSurfer" cannot be found.');
        } else {
            //create wavesurfer object
            ETaudio.oWavesurfer = WaveSurfer.create({
                container: ETaudio.sWaveform,
                waveColor: ETaudio.sWaveColor,
                progressColor: ETaudio.sWaveProgressColor
            });
            //init controls
            $(ETaudio.sZoomSlider).get(0).oninput = ETaudio.zoom;
            $(ETaudio.sPlayJump).on('click', function(_oEvent) {
                    _oEvent.preventDefault();
                    ETaudio.jumpBySeconds(ETaudio.getCurrentPos() - 4);
                    ETaudio.play();
                });
            $(ETaudio.sPlayPause).on('click', function(_oEvent) {
                    _oEvent.preventDefault();
                    ETaudio.playPause();
                });
        }
    },
    
    load: function(_sFile, _fCallback) {
        if(ETaudio.oWavesurfer === null) {
            ETaudio.init();
        }
        if(ETaudio.oWavesurfer !== null) {
            ETaudio.oWavesurfer.on('ready', function() {
                    if(typeof(_fCallback) !== 'undefined') {
                        _fCallback();
                    }
                });
            ETaudio.oWavesurfer.load(_sFile + ETaudio.sUrlSuffix);
        }
    },
    
    zoom: function() {
        if(ETaudio.oWavesurfer !== null) {
            var nZoomLevel = Number($(ETaudio.sZoomSlider).val());
            ETaudio.oWavesurfer.zoom(nZoomLevel);
        }
    },
    
    playPause: function() {
        if(ETaudio.oWavesurfer !== null) {
            ETaudio.oWavesurfer.playPause();
        }
    },
    
    play: function() {
        if(ETaudio.oWavesurfer !== null) {
            ETaudio.oWavesurfer.play();
        }
    },
    
    pause: function() {
        if(ETaudio.oWavesurfer !== null) {
            ETaudio.oWavesurfer.pause();
        }
    },
    
    jump: function(_nPercentage) {
        if(ETaudio.oWavesurfer !== null) {
            ETaudio.oWavesurfer.seekAndCenter(Number(_nPercentage));
        }
    },
    
    jumpBySeconds: function(_nSeconds) {
        if(ETaudio.oWavesurfer !== null) {
            ETaudio.jump(Number(_nSeconds)/ETaudio.getLength());
        }
    },
    
    setSpeed: function(_nSpeedPercentage) {
        if(ETaudio.oWavesurfer !== null) {
            ETaudio.oWavesurfer.setPlaybackRate(Number(_nSpeedPercentage));
        }
    },
    
    setVolume: function(_nVolumePercentage) {
        if(ETaudio.oWavesurfer !== null) {
            ETaudio.oWavesurfer.setVolume(Number(_nVolumePercentage));
        }
    },
    
    getCurrentPos: function() {
        if(ETaudio.oWavesurfer !== null) {
            return ETaudio.oWavesurfer.getCurrentTime();
        }
    },
    
    getLength: function() {
        if(ETaudio.oWavesurfer !== null) {
            return ETaudio.oWavesurfer.getDuration();
        }
    },
    
    setPlayerCallback: function(_fCallback) {
        if(ETaudio.oWavesurfer !== null) {
            ETaudio.oWavesurfer.on('audioprocess', function() {
                    _fCallback(ETaudio.oWavesurfer.getCurrentTime());
                });
        }
    },
    
    setServerPassword: function(_sHash) {
        ETaudio.sUrlSuffix = '?p=' + _sHash;
    }
};