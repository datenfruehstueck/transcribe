var ETfile = {
    sFileUpload: '#fileupload',
    sProgressBar: '#progress',
    fCallbackStart: null,
    fCallbackEnd: null,
    sServer: 'api/',
    
    init: function() {
        $(ETfile.sFileUpload).fileupload({
            url: ETfile.sServer,
            dataType: 'json',
            start: function(e) {
                $(ETfile.sFileUpload).get(0).disabled = true;
                if(ETfile.fCallbackStart !== null) {
                    ETfile.fCallbackStart();
                }
            },
            done: function(e, data) {
                ETfile.done(data.result.files);
            },
            progressall: function(e, data) {
                var progress = parseInt(data.loaded / data.total * 100, 10);
                $(ETfile.sProgressBar + ' .progress-bar').css('width', progress + '%');
            },
            fail: function(e, data) {
                alert('Oh, I am sorry but the upload failed. Please try again.');
                $(ETfile.sFileUpload).get(0).disabled = false;
            }
        });
    },
    
    setServerPassword: function(_sUser, _sHash) {
        ETfile.sServer += '?u=' + _sUser + '&p=' + _sHash;
    },
    
    setCallback: function(_fStart, _fEnd) {
        ETfile.fCallbackStart = _fStart;
        ETfile.fCallbackEnd = _fEnd;
    },
    
    done: function(_aFileUpload) {
        $(ETfile.sFileUpload).get(0).disabled = false;
        if(_aFileUpload.length > 0 && ETfile.fCallbackEnd !== null) {
            ETfile.fCallbackEnd(_aFileUpload[0]);
        }
    }
};