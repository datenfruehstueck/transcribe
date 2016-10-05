var oApp = {};
$(function() {
    /**
     * Display a single page.
     * @param {string} _sNewPage one of login, load, upload, or transcribe
     */
    function togglePage(_sNewPage) {
        $('#page_login, #page_upload, #page_transcribe, #page_load').addClass('hidden');
        $('#page_' + _sNewPage).removeClass('hidden');
    }
    
    //login handler
    $('#page_login input').on('keypress', function(_oEvent) {
        if(_oEvent.which == 13) {
            $('#page_login .btn-success').click();
        }
    });
    $('#page_login .btn-success').on('click', function(_oEvent) {
        _oEvent.preventDefault();
        togglePage('load');
        var sPasswordHash = CryptoJS.MD5($('#page_login input').val() + 'SALT').toString();
        //set upload page
        ETfile.setServerPassword(sPasswordHash);
        ETfile.init();
        ETtranscript.setServerPassword(sPasswordHash);
        //load available transcripts
        $.getJSON('api/?a=list&p=' + sPasswordHash, function(_oResult) {
                if(_oResult.success && typeof(_oResult.data) !== 'undefined') {
                    $.each(_oResult.data, function(_i, _oTranscript) {
                        oApp['nTraId-' + _oTranscript.nTraId] = _oTranscript;
                        $('#choosetranscript').append('<option value="' + _oTranscript.nTraId + '">' + _oTranscript.sName + 
                                                      ' (last change ' + moment.unix(_oTranscript.dUpdate).fromNow() + ')</option>');
                    });
                    $('#choosetranscript').change(function() {
                        togglePage('load');
                        ETtranscript.load(Number($(this).find('option:selected').attr('value')), function() {
                                togglePage('transcribe');
                            });
                    });
                }
                //show upload page
                togglePage('upload')
            });
    });
    $('#page_login input').get(0).focus();
    
    //upload handler
    ETfile.setCallback(function() {}, function(_oFile) {
            if(typeof(_oFile.url) === 'undefined') {
                alert('File upload is errornous. ' + (typeof(_oFile.error) !== 'undefined' ? _oFile.error : ''));
            } else {
                ETtranscript.create(_oFile.url, '', function() {
                        togglePage('transcribe');
                    });
            }
        });
})