var ETtranscript = {
    sServer: 'api/',
    sTranscriptControl: '#transcriptcontrol',
    sTranscriptList: '#transcriptlist',
    sTranscript: '#transcript',
    sCurrentParty: '#nCurrentParty',
    sTimeCurrent: '.sTimeCurrent',
    sTimeTotal: '.sTimeTotal',
    oTranscript: null,
    aPart: null,
    nCurrentParty: 1,
    nCurrentOffset: 0,
    oTranscriptCache: null,
    fCallbackOnLoad: null,
    nLoaded: 0,
    
    init: function() {
        if(ETtranscript.oTranscript !== null) {
            if(typeof(ETtranscript.oTranscript.sAudio) === 'undefined' || ETtranscript.oTranscript.sAudio == '') {
                alert('Whew, I am terribly sorry but the audio file cannot be found. Please try again or contact someone. Anyone.');
            } else {
                if(ETtranscript.fCallbackOnLoad !== null) {
                    ETtranscript.fCallbackOnLoad();
                }
                ETaudio.load(ETtranscript.oTranscript.sAudio, function() {
                        $(ETtranscript.sTimeTotal).text(ETtranscript.convertOffsetToTime(ETaudio.getLength()));
                        $(ETtranscript.sTimeCurrent).text(ETtranscript.convertOffsetToTime(ETtranscript.oTranscript.nCurrentOffset));
                        ETaudio.jumpBySeconds(ETtranscript.oTranscript.nCurrentOffset);
                        ETaudio.setPlayerCallback(function(_nPosition) {
                                $(ETtranscript.sTimeCurrent).text(ETtranscript.convertOffsetToTime(_nPosition));
                            });
                        ETtranscript.finalizeInit();
                    });
                ETtranscript.initTranscriptControls();
                $(ETtranscript.sTranscriptControl).find('.parties, .speed, .volume').on('change', function() {
                        ETtranscript.updateTranscript();
                    });
                $(ETtranscript.sCurrentParty).on('change', function() {
                        ETtranscript.nCurrentParty = $(this).val();
                        ETtranscript.updateTranscript();
                    });
                $(ETtranscript.sTranscriptControl).find('.download').on('click', function(_oEvent) {
                        _oEvent.preventDefault();
                        if(confirm('You need to have popups enabled in order to download things here.')) {
                            $.post(ETtranscript.sServer + '&a=download', { nTraId: ETtranscript.oTranscript.nTraId, bWithTimecodes: Number($(this).hasClass('with')) },
                                function(_oResult) {
                                    if(_oResult.success && typeof(_oResult.data) !== 'undefined') {
                                        window.open('data:text/plain;charset=utf-8,' + encodeURIComponent(_oResult.data.join('\n')), 'easytranscript.txt');
                                    } else {
                                        alert('Uah, sorry, but the download failed (' + _oResult.error + '). Please try to try again.');
                                    }
                                }, 'json');
                        }
                    });
                $(ETtranscript.sTranscript).on('keydown', function(_oEvent) {
                        switch(_oEvent.which) {
                            case 13: //enter
                                if(!_oEvent.shiftKey) {
                                    _oEvent.preventDefault();
                                    ETtranscript.addPart();
                                }
                                break;
                            case 112: //f1
                            case 113: //f2
                            case 114: //f3
                            case 115: //f4
                                _oEvent.preventDefault();
                                ETaudio.jumpBySeconds(ETaudio.getCurrentPos()-(_oEvent.which - 111));
                                ETaudio.play();
                                break;
                            case 116: //f5
                                _oEvent.preventDefault();
                                ETaudio.playPause();
                                break;
                        }
                    });
                $.post(ETtranscript.sServer + '&a=load', { nTraId: ETtranscript.oTranscript.nTraId }, function(_oResult) {
                        if(_oResult.success && typeof(_oResult.data) !== 'undefined') {
                            ETtranscript.aPart = _oResult.data;
                            ETtranscript.finalizeInit();
                        } else {
                            alert('An error occured while loading (' + _oResult.error + '). Please try again.');
                        }
                    }, 'json');
            }
        }
    },
    
    finalizeInit: function() {
        ETtranscript.nLoaded++;
        if(ETtranscript.nLoaded == 2) {
            if(ETtranscript.aPart.length > 0) {
                $.each(ETtranscript.aPart, function(_i, _oPart) {
                        $(ETtranscript.sTranscriptList).append(ETtranscript.visualize(_i));
                        ETtranscript.initListener(_oPart.nParId);
                    });
                $('body').scrollTop($(ETtranscript.sTranscriptList).find('div[data-id]').last().offset().top);
            }
            alert('Now, loading is done and you can start transcribing.');
            $(ETtranscript.sTranscript).get(0).focus();
        }
    },
    
    initTranscriptControls: function() {
        $(ETtranscript.sTranscriptControl).find('.parties').val(ETtranscript.oTranscript.nPartyCount);
        $(ETtranscript.sTranscriptControl).find('.speed').val(ETtranscript.oTranscript.nSpeed*100);
        $(ETtranscript.sTranscriptControl).find('.volume').val(ETtranscript.oTranscript.nVolume*100);
        //set data
        ETaudio.setSpeed(ETtranscript.oTranscript.nSpeed);
        ETaudio.setVolume(ETtranscript.oTranscript.nVolume);
        //init current party dropdown
        $(ETtranscript.sCurrentParty).find('option').remove();
        for(var i = 1; i <= ETtranscript.oTranscript.nPartyCount; i++) {
            $(ETtranscript.sCurrentParty).append('<option value="' + i + '">' + i + '</option>');
        }
        $(ETtranscript.sCurrentParty).val(ETtranscript.nCurrentParty);
    },
    
    load: function(_nTraId, _fCallback) {
        ETtranscript.oTranscript = oApp['nTraId-' + _nTraId];
        if(typeof(_fCallback) !== 'undefined') {
            ETtranscript.fCallbackOnLoad = _fCallback;
        }
        ETtranscript.init();
    },
    
    create: function(_sFile, _sAskForNamePrefix, _fCallback) {
        if(typeof(_fCallback) !== 'undefined') {
            ETtranscript.fCallbackOnLoad = _fCallback;
        }
        var sPrefix = '';
        if(typeof(_sAskForNamePrefix) !== 'undefined' && _sAskForNamePrefix != '') {
            sPrefix = _sAskForNamePrefix + '\n\n';
        }
        var sName = $.trim(prompt(sPrefix + 'Enter a unique name for your transcript:'));
        if(sName == '') {
            ETtranscript.create(_sFile, 'Empty strings are not allowed.');
        } else {
            $.post(ETtranscript.sServer + '&a=addT', { sName: sName, sAudio: _sFile }, function(_oResult) {
                    if(_oResult.success && typeof(_oResult.data) !== 'undefined') {
                        oApp['nTraId-' + _oResult.nTraId] = _oResult.data;
                        ETtranscript.oTranscript = _oResult.data;
                        ETtranscript.init();
                    } else {
                        ETtranscript.create(_sFile, 'This name is taken already.');
                    }
                }, 'json');
        }
    },
    
    getPartyColor: function(_nParty) {
        var aColor = [ '#000080', '#009000', '#000', '#F00', '#703070', '#808000', '#0FF', '#800000', '#F0F' ];
        _nParty--;
        while(_nParty > aColor.length) {
            _nParty -= aColor.length;
        }
        return aColor[_nParty];
    },
    
    convertOffsetToTime: function(_nOffset) {
        var nTotalLength = ETaudio.getLength(),
            aTime = [ 0, 0, 0 ];
        //calculate time
        if(_nOffset > 3600) {
            aTime[0] = Math.floor(_nOffset/3600);
            _nOffset = _nOffset % 3600;
        }
        if(_nOffset > 60) {
            aTime[1] = Math.floor(_nOffset/60);
            _nOffset = _nOffset % 60;
        }
        aTime[2] = parseInt(_nOffset);
        //reformat and define format
        var fWithZero = function(n) { return n < 10 ? ('0' + n) : n };
        if(nTotalLength > 3600) {
            return aTime[0] + ':' + fWithZero(aTime[1]) + ':' + fWithZero(aTime[2]);
        } else if(nTotalLength > 60) {
            return aTime[1] + ':' + fWithZero(aTime[2]);
        } else {
            return aTime[2];
        }
    },
    
    visualize: function(_nPartIndex) {
        var oPart = ETtranscript.aPart[_nPartIndex];
        var sPartyColor = ETtranscript.getPartyColor(oPart.nParty);
        return '<div data-id="' + oPart.nParId + '" class="part" style="border-left-color: ' + sPartyColor + ';">' +
                '<h4 style="color: ' + sPartyColor + ';">#' + oPart.nParty + ', ' + ETtranscript.convertOffsetToTime(oPart.nOffset) + 
                ' &middot; <a href="#" class="btn btn">delete</a>' +
                '</h4>' + 
                '<textarea class="form-control justreadme">' + oPart.sTranscript + '</textarea>' +
            '</div>';
    },
    
    getPartIndexFromId: function(_nParId) {
        for(var i = 0; i < ETtranscript.aPart.length; i++) {
            if(ETtranscript.aPart[i].nParId == _nParId) {
                return i;
            }
        }
        return -1;
    },
    
    initListener: function(_nParId) {
        var $oTextarea = $(ETtranscript.sTranscriptList).find('div[data-id="' + _nParId + '"] textarea');
        $oTextarea.height($oTextarea.get(0).scrollHeight);
        $(ETtranscript.sTranscriptList).find('div[data-id="' + _nParId + '"] a.btn-danger').on('click', function(_oEvent) {
                _oEvent.preventDefault();
                if(confirm('Are you sure you want to delete this part?')) {
                    ETtranscript.deletePart(ETtranscript.getPartIndexFromId(_nParId));
                }
            });
        $(ETtranscript.sTranscriptList).find('div[data-id="' + _nParId + '"] textarea')
            .on('focusin', function(_oEvent) {
                _oEvent.preventDefault();
                $(this).removeClass('justreadme');
                ETaudio.jumpBySeconds(ETtranscript.aPart[ETtranscript.getPartIndexFromId(_nParId)].nOffset);
                ETaudio.play();
            })
            .on('focusout', function(_oEvent) {
                _oEvent.preventDefault();
                $(this).addClass('justreadme');
                ETaudio.pause();
                ETtranscript.updatePart(ETtranscript.getPartIndexFromId(_nParId));
            });
    },
    
    addPart: function(_bUseCache) {
        if(typeof(_bUseCache) === 'undefined' || !_bUseCache) {
            ETtranscript.oTranscriptCache = { 
                nTraId: ETtranscript.oTranscript.nTraId, 
                nOffset: ETtranscript.nCurrentOffset, 
                nParty: ETtranscript.nCurrentParty, 
                sTranscript: $(ETtranscript.sTranscript).val() 
            };
        }
        $.post(ETtranscript.sServer + '&a=addP', ETtranscript.oTranscriptCache, function(_oResult) {
                if(_oResult.success && typeof(_oResult.data) !== 'undefined') {
                    ETtranscript.aPart.push(_oResult.data);
                    $(ETtranscript.sTranscriptList).append(ETtranscript.visualize(ETtranscript.aPart.length - 1));
                    ETtranscript.initListener(_oResult.nParId);
                    $('body').scrollTop($(ETtranscript.sTranscriptList).find('div[data-id="' + _oResult.nParId + '"]').offset().top);
                } else {
                    ETaudio.pause();
                    alert('Uh-oh, something went wrong during saving.');
                    if(confirm('Do you want to try the last transcript again?')) {
                        ETtranscript.addPart(true);
                    }
                }
            }, 'json');
        //update party, offset, and textarea
        ETtranscript.nCurrentOffset = ETaudio.getCurrentPos();
        ETtranscript.nCurrentParty = ETtranscript.oTranscriptCache.nParty + 1;
        if(ETtranscript.nCurrentParty > ETtranscript.oTranscript.nPartyCount) {
            ETtranscript.nCurrentParty = 1;
        }
        ETtranscript.updateTranscript();
        $(ETtranscript.sCurrentParty).val(ETtranscript.nCurrentParty);
        $(ETtranscript.sTranscript).val('');
    },
    
    updatePart: function(_nPart, _bUseCache) {
        if(typeof(_bUseCache) === 'undefined' || !_bUseCache) {
            ETtranscript.oTranscriptCache = { 
                nParId: ETtranscript.aPart[_nPart].nParId, 
                nOffset: ETtranscript.aPart[_nPart].nOffset, 
                nParty: ETtranscript.aPart[_nPart].nParty, 
                sTranscript: $(ETtranscript.sTranscriptList).find('div[data-id="' + ETtranscript.aPart[_nPart].nParId + '"] textarea').val() 
            };
        }
        $.post(ETtranscript.sServer + '&a=updateP', ETtranscript.oTranscriptCache, function(_oResult) {
                if(_oResult.success && typeof(_oResult.data) !== 'undefined') {
                    ETtranscript.aPart[_nPart] = _oResult.data;
                    $(ETtranscript.sTranscriptList).find('div[data-id="' + ETtranscript.aPart[_nPart].nParId + '"] textarea').val(_oResult.data.sTranscript);
                } else {
                    alert('Uh-oh, something went wrong during the update.');
                    if(confirm('Do you want to try to update this part again?')) {
                        ETtranscript.updatePart(_nPart, true);
                    }
                }
            }, 'json');
    },
    
    updateTranscript: function() {
        $.post(ETtranscript.sServer + '&a=updateT', {
                nTraId: ETtranscript.oTranscript.nTraId,
                nPartyCount: Math.abs($(ETtranscript.sTranscriptControl).find('.parties').val()),
                nSpeed: $(ETtranscript.sTranscriptControl).find('.speed').val()/100,
                nVolume: $(ETtranscript.sTranscriptControl).find('.volume').val()/100,
                nCurrentOffset: ETtranscript.nCurrentOffset,
                nCurrentParty: ETtranscript.nCurrentParty
            }, function(_oResult) {
                if(_oResult.success && typeof(_oResult.data) !== 'undefined') {
                    ETtranscript.oTranscript.nPartyCount = _oResult.data.nPartyCount;
                    ETtranscript.oTranscript.nSpeed = _oResult.data.nSpeed;
                    ETtranscript.oTranscript.nVolume = _oResult.data.nVolume;
                    ETtranscript.initTranscriptControls();
                } else {
                    alert('Urghs, something went wrong during the update. Please try to change it again.');
                }
            }, 'json');
    },
    
    deletePart: function(_nPart) {
        $.post(ETtranscript.sServer + '&a=deleteP', { nParId: ETtranscript.aPart[_nPart].nParId }, function(_oResult) {
                if(_oResult.success && typeof(_oResult.nParId) !== 'undefined') {
                    ETtranscript.aPart.splice(_nPart, 1);
                    $(ETtranscript.sTranscriptList).find('div[data-id="' + _oResult.nParId + '"]').remove();
                } else {
                    ETaudio.pause();
                    alert('Uh-oh, something went wrong during deletion (' + _oResult.error + '). Unless something is unsaved, it is probably best to reload.');
                }
            }, 'json');
    },
    
    setServerPassword: function(_sHash) {
        ETtranscript.sServer += '?p=' + _sHash;
        ETaudio.setServerPassword(_sHash);
    }
};