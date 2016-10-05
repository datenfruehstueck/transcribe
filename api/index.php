<?php
/*
 * jQuery File Upload Plugin PHP Example
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

error_reporting(E_ALL | E_STRICT);

//function to load a single row
function loadSingleRow(&$_oDb, $_sTable, $_nKey) {
    if(($oResult = $_oDb->query(sprintf('SELECT * FROM `%s` WHERE %s = %d LIMIT 1', $_sTable, ($_sTable == 'transcript' ? 'nTraId' : 'nParId'), intval($_nKey))))) {
        return $oResult->fetch_assoc();
    }
    return [];
}
//added password protection by MarHai
require_once('config.php');
if(isset($_GET['p']) && strtolower($_GET['p']) === PASSWORD_HASH) {
	unset($_GET['p']);
    //added API actions
    if(isset($_GET['a'])) {
        $oDb = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE);
        $oDb->query('SET NAMES utf8');
        $aResult = [];
        switch($_GET['a']) {
            case 'load':
                $aResult['nTraId'] = intval($_POST['nTraId']);
                if(($oResult = $oDb->query(sprintf('SELECT * FROM `part` WHERE nTraId = %d ORDER BY nOffset ASC', $aResult['nTraId'])))) {
                    $aResult['success'] = TRUE;
                    $aResult['data'] = [];
                    while(($aRow = $oResult->fetch_assoc())) {
                        $aResult['data'][] = $aRow;
                    }
                } else {
                    $aResult['success'] = FALSE;
                    $aResult['error'] = 'Loading parts failed due to '.$oDb->error;
                }
                break;
            case 'addT':
                if(($oDb->query(sprintf('INSERT INTO `transcript` (dCreate, dUpdate, nPartyCount, nSpeed, nVolume, sName, sAudio) 
                                        VALUES (%d, %d, %d, %.2f, %.2f, \'%s\', \'%s\')', 
                                        time(),
                                        time(),
                                        1,
                                        1.0,
                                        1.0,
                                        addslashes($_POST['sName']),
                                        addslashes($_POST['sAudio']))))) {
                    
                    $aResult['success'] = TRUE;
                    $aResult['nTraId'] = $oDb->insert_id;
                    $aResult['data'] = loadSingleRow($oDb, 'transcript', $aResult['nTraId']);
                } else {
                    $aResult['success'] = FALSE;
                    $aResult['error'] = 'Creating this transcript failed due to '.$oDb->error;
                }
                break;
            case 'addP':
                if(($oDb->query(sprintf('INSERT INTO `part` (nTraId, dCreate, dUpdate, nOffset, nParty, sTranscript) 
                                        VALUES (%d, %d, %d, %d, %d, \'%s\')', 
                                        intval($_POST['nTraId']),
                                        time(),
                                        time(),
                                        intval($_POST['nOffset']),
                                        intval($_POST['nParty']),
                                        addslashes($_POST['sTranscript']))))) {
                    
                    $aResult['success'] = TRUE;
                    $aResult['nParId'] = $oDb->insert_id;
                    $aResult['data'] = loadSingleRow($oDb, 'part', $aResult['nParId']);
                } else {
                    $aResult['success'] = FALSE;
                    $aResult['error'] = 'Insertion failed due to '.$oDb->error;
                }
                break;
            case 'deleteP':
                $aResult['nParId'] = intval($_POST['nParId']);
                if(($oDb->query(sprintf('DELETE FROM `part` WHERE nParId = %d LIMIT 1', $aResult['nParId'])))) {
                    $aResult['success'] = TRUE;
                } else {
                    $aResult['success'] = FALSE;
                    $aResult['error'] = 'Deletion failed due to '.$oDb->error;
                }
                break;
            case 'updateP':
                $aResult['nParId'] = intval($_POST['nParId']);
                if(($oDb->query(sprintf('UPDATE `part` SET dUpdate = %d, nOffset = %d, nParty = %d, sTranscript = \'%s\' WHERE nParId = %d LIMIT 1', 
                                        time(),
                                        intval($_POST['nOffset']),
                                        intval($_POST['nParty']),
                                        addslashes($_POST['sTranscript']),
                                        $aResult['nParId'])))) {
                    
                    $aResult['success'] = TRUE;
                    $aResult['data'] = loadSingleRow($oDb, 'part', $aResult['nParId']);
                } else {
                    $aResult['success'] = FALSE;
                    $aResult['error'] = 'Update failed due to '.$oDb->error;
                }
                break;
            case 'updateT':
                $aResult['nTraId'] = intval($_POST['nTraId']);
                if(($oDb->query(sprintf('UPDATE `transcript` SET dUpdate = %d, nPartyCount = %d, nSpeed = %.2f, nVolume = %.2f, nCurrentParty = %d, nCurrentOffset = %d WHERE nTraId = %d LIMIT 1', 
                                        time(),
                                        intval($_POST['nPartyCount']),
                                        floatval($_POST['nSpeed']),
                                        floatval($_POST['nVolume']),
                                        intval($_POST['nCurrentParty']),
                                        intval($_POST['nCurrentOffset']),
                                        $aResult['nTraId'])))) {
                    
                    $aResult['success'] = TRUE;
                    $aResult['data'] = loadSingleRow($oDb, 'transcript', $aResult['nTraId']);
                } else {
                    $aResult['success'] = FALSE;
                    $aResult['error'] = 'Updating the transcript failed due to '.$oDb->error;
                }
                break;
            case 'download':
                $aResult['nTraId'] = intval($_POST['nTraId']);
                $aResult['bWithTimecodes'] = intval($_POST['bWithTimecodes']) ? TRUE : FALSE;
                if(($oResult = $oDb->query(sprintf('SELECT * FROM `part` WHERE nTraId = %d ORDER BY nOffset ASC', $aResult['nTraId'])))) {
                    if($oResult->num_rows == 0) {
                        $aResult['success'] = FALSE;
                        $aResult['error'] = 'No transcript parts found.';
                    } else {
                        $aResult['success'] = TRUE;
                        $aResult['data'] = [];
                        $aTranscript = loadSingleRow($oDb, 'transcript', $aResult['nTraId']);
                        $aResult['data'][] = $aTranscript['sName'];
                        $aResult['data'][] = sprintf('(created with Easy Transcript <https://github.com/MarHai/easytranscript> on %s, last change on %s)', 
                                                     date('Y-m-d H:i', $aTranscript['dCreate']), 
                                                     date('Y-m-d H:i', $aTranscript['dUpdate'])
                                                    );
                        $nLastParty = NULL;
                        while(($aRow = $oResult->fetch_assoc())) {
                            if($nLastParty !== $aRow['nParty']) {
                                $nLastParty = $aRow['nParty'];
                                $aResult['data'][] = '';
                                $aResult['data'][] = '#'.$nLastParty;
                            }
                            $sLine = '';
                            if($aResult['bWithTimecodes']) {
                                $sLine .= '[';
                                $aTime = [];
                                $aTime[] = floor($aRow['nOffset']/3600);
                                $aRow['nOffset'] = $aRow['nOffset'] % 3600;
                                $aTime[] = floor($aRow['nOffset']/60);
                                $aRow['nOffset'] = $aRow['nOffset'] % 60;
                                $aTime[] = intval($aRow['nOffset']);
                                for($i = 0; $i < count($aTime); $i++) {
                                    if($i > 0) {
                                        $sLine .= ':';
                                    }
                                    $sLine .= $aTime[$i] < 10 ? '0' : '';
                                    $sLine .= $aTime[$i];
                                }
                                $sLine .= '] ';
                            }
                            $sLine .= $aRow['sTranscript'];
                            $aResult['data'][] = $sLine;
                        }
                    }
                } else {
                    $aResult['success'] = FALSE;
                    $aResult['error'] = 'Loading single parts failed due to '.$oDb->error;
                }
                break;
            case 'list':
            default:
                if(($oResult = $oDb->query('SELECT * FROM `transcript` ORDER BY dUpdate DESC'))) {
                    $aResult['success'] = TRUE;
                    $aResult['data'] = [];
                    while(($aRow = $oResult->fetch_assoc())) {
                        $aResult['data'][] = $aRow;
                    }
                } else {
                    $aResult['success'] = FALSE;
                    $aResult['error'] = 'Listing transcripts failed due to '.$oDb->error;
                }
                break;
        }
        $oDb->close();
        echo(json_encode($aResult));
    } else {
        require('UploadHandler.php');
        $upload_handler = new UploadHandler();
    }
} else {
    die('{"error":"Incorrect password"}');
}
