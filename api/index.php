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
$oDb = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE);
$oDb->query('SET NAMES utf8');
$nLogin = login($oDb);
if($nLogin !== NULL && $nLogin > 0) {
    //added API actions
    if (isset($_GET['a'])) {
        $aResult = [];
        switch ($_GET['a']) {
            case 'load':
                $aResult['nTraId'] = intval($_POST['nTraId']);
                $aTranscript = loadSingleRow($oDb, 'transcript', $aResult['nTraId']);
                if (isset($aTranscript['nUseId']) && $aTranscript['nUseId'] == $nLogin) {
                    if (($oResult = $oDb->query(sprintf('SELECT * FROM `part` WHERE nTraId = %d ORDER BY nOffset ASC', $aResult['nTraId'])))) {
                        $aResult['success'] = TRUE;
                        $aResult['data'] = [];
                        while (($aRow = $oResult->fetch_assoc())) {
                            $aResult['data'][] = $aRow;
                        }
                    } else {
                        $aResult['success'] = FALSE;
                        $aResult['error'] = 'Loading parts failed due to ' . $oDb->error;
                    }
                } else {
                    $aResult['success'] = FALSE;
                    $aResult['error'] = 'No permission';
                }
                break;
            case 'addT':
                if (($oDb->query(sprintf('INSERT INTO `transcript` (nUseId, dCreate, dUpdate, nPartyCount, nSpeed, nVolume, sName, sAudio) 
                                        VALUES (%d, %d, %d, %d, %.2f, %.2f, \'%s\', \'%s\')',
                    $nLogin,
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
                    $aResult['error'] = 'Creating this transcript failed due to ' . $oDb->error;
                }
                break;
            case 'addP':
                $nTraId = intval($_POST['nTraId']);
                $aTranscript = loadSingleRow($oDb, 'transcript', $nTraId);
                if (isset($aTranscript['nUseId']) && $aTranscript['nUseId'] == $nLogin) {
                    if (($oDb->query(sprintf('INSERT INTO `part` (nTraId, dCreate, dUpdate, nOffset, nParty, sTranscript) 
                                            VALUES (%d, %d, %d, %d, %d, \'%s\')',
                        $nTraId,
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
                        $aResult['error'] = 'Insertion failed due to ' . $oDb->error;
                    }
                } else {
                    $aResult['success'] = FALSE;
                    $aResult['error'] = 'No permission';
                }
                break;
            case 'deleteP':
                $aResult['nParId'] = intval($_POST['nParId']);
                $aPart = loadSingleRow($oDb, 'part', $aResult['nParId']);
                $aTranscript = loadSingleRow($oDb, 'transcript', $aPart['nTraId']);
                if (isset($aTranscript['nUseId']) && $aTranscript['nUseId'] == $nLogin) {
                    if (($oDb->query(sprintf('DELETE FROM `part` WHERE nParId = %d LIMIT 1', $aResult['nParId'])))) {
                        $aResult['success'] = TRUE;
                    } else {
                        $aResult['success'] = FALSE;
                        $aResult['error'] = 'Deletion failed due to ' . $oDb->error;
                    }
                } else {
                    $aResult['success'] = FALSE;
                    $aResult['error'] = 'No permission';
                }
                break;
            case 'updateP':
                $aResult['nParId'] = intval($_POST['nParId']);
                $aPart = loadSingleRow($oDb, 'part', $aResult['nParId']);
                $aTranscript = loadSingleRow($oDb, 'transcript', $aPart['nTraId']);
                if (isset($aTranscript['nUseId']) && $aTranscript['nUseId'] == $nLogin) {
                    if (($oDb->query(sprintf('UPDATE `part` SET dUpdate = %d, nOffset = %d, nParty = %d, sTranscript = \'%s\' WHERE nParId = %d LIMIT 1',
                        time(),
                        intval($_POST['nOffset']),
                        intval($_POST['nParty']),
                        addslashes($_POST['sTranscript']),
                        $aResult['nParId'])))) {

                        $aResult['success'] = TRUE;
                        $aResult['data'] = loadSingleRow($oDb, 'part', $aResult['nParId']);
                    } else {
                        $aResult['success'] = FALSE;
                        $aResult['error'] = 'Update failed due to ' . $oDb->error;
                    }
                } else {
                    $aResult['success'] = FALSE;
                    $aResult['error'] = 'No permission';
                }
                break;
            case 'updateT':
                $aResult['nTraId'] = intval($_POST['nTraId']);
                if (($oDb->query(sprintf('UPDATE `transcript` SET dUpdate = %d, nPartyCount = %d, nSpeed = %.2f, nVolume = %.2f, nCurrentParty = %d, nCurrentOffset = %d WHERE nTraId = %d AND nUseId = %d LIMIT 1',
                    time(),
                    intval($_POST['nPartyCount']),
                    floatval($_POST['nSpeed']),
                    floatval($_POST['nVolume']),
                    intval($_POST['nCurrentParty']),
                    intval($_POST['nCurrentOffset']),
                    $aResult['nTraId'],
                    $nLogin)))) {

                    $aResult['success'] = TRUE;
                    $aResult['data'] = loadSingleRow($oDb, 'transcript', $aResult['nTraId']);
                } else {
                    $aResult['success'] = FALSE;
                    $aResult['error'] = 'Updating the transcript failed due to ' . $oDb->error;
                }
                break;
            case 'download':
                $aResult['nTraId'] = intval($_POST['nTraId']);
                $aResult['bWithTimecodes'] = intval($_POST['bWithTimecodes']) ? TRUE : FALSE;
                if (($oResult = $oDb->query(sprintf('SELECT * FROM `part` WHERE nTraId = %d ORDER BY nOffset ASC', $aResult['nTraId'])))) {
                    if ($oResult->num_rows == 0) {
                        $aResult['success'] = FALSE;
                        $aResult['error'] = 'No transcript parts found.';
                    } else {
                        $aResult['success'] = TRUE;
                        $aResult['data'] = [];
                        $aTranscript = loadSingleRow($oDb, 'transcript', $aResult['nTraId']);
                        if (isset($aTranscript['nUseId']) && $aTranscript['nUseId'] == $nLogin) {
                            $aResult['data'][] = $aTranscript['sName'];
                            $aResult['data'][] = sprintf('(created with Easy Transcript <https://github.com/MarHai/easytranscript> on %s, last change on %s)',
                                date('Y-m-d H:i', $aTranscript['dCreate']),
                                date('Y-m-d H:i', $aTranscript['dUpdate'])
                            );
                            $nLastParty = NULL;
                            while (($aRow = $oResult->fetch_assoc())) {
                                if ($nLastParty !== $aRow['nParty']) {
                                    $nLastParty = $aRow['nParty'];
                                    $aResult['data'][] = '';
                                    $aResult['data'][] = '#' . $nLastParty;
                                }
                                $sLine = '';
                                if ($aResult['bWithTimecodes']) {
                                    $sLine .= '[';
                                    $aTime = [];
                                    $aTime[] = floor($aRow['nOffset'] / 3600);
                                    $aRow['nOffset'] = $aRow['nOffset'] % 3600;
                                    $aTime[] = floor($aRow['nOffset'] / 60);
                                    $aRow['nOffset'] = $aRow['nOffset'] % 60;
                                    $aTime[] = intval($aRow['nOffset']);
                                    for ($i = 0; $i < count($aTime); $i++) {
                                        if ($i > 0) {
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
                        } else {
                            $aResult['success'] = FALSE;
                            $aResult['error'] = 'No permission';
                        }
                    }
                } else {
                    $aResult['success'] = FALSE;
                    $aResult['error'] = 'Loading single parts failed due to ' . $oDb->error;
                }
                break;
            case 'list':
            default:
                if (($oResult = $oDb->query(sprintf('SELECT * FROM `transcript` WHERE nUseId = %d ORDER BY dUpdate DESC', $nLogin)))) {
                    $aResult['success'] = TRUE;
                    $aResult['data'] = [];
                    while (($aRow = $oResult->fetch_assoc())) {
                        $aResult['data'][] = $aRow;
                    }
                } else {
                    $aResult['success'] = FALSE;
                    $aResult['error'] = 'Listing transcripts failed due to ' . $oDb->error;
                }
                break;
        }
        $oDb->close();
        echo(json_encode($aResult));
    } else {
        require('UploadHandler.php');
        $upload_handler = new UploadHandler();
    }
} elseif (isset($_GET['activate'])) {
    if (($oResult = $oDb->query(sprintf('SELECT * FROM `user` WHERE MD5(sMail) = \'%s\' LIMIT 1', rawurldecode($_GET['activate']))))) {
        if ($oResult->num_rows == 1) {
            $aRow = $oResult->fetch_assoc();
            $email = $aRow['sMail'];
            if($oDb->query(sprintf('UPDATE `user` SET bActive = 1 WHERE sMail = \'%s\' LIMIT 1', $email))) {
                @mail($email,
                    'Transcript user registration completed',
                    'Your account for '.MAIN_URL.' has just been activated. You may use the platform now.',
                    'From: '.TEAM_MAIL."\r\n".'X-Mailer: PHP/' . phpversion());
                die('Successful');
            }
        }
    }
    die('User not found');
} elseif (isset($_GET['r']) && isset($_GET['p'])) {
    if($oDb->query(sprintf('INSERT INTO `user` (sMail, sPassword, dCreate, bActive) VALUES (\'%s\', \'%s\', %d, 0)', $_GET['r'], $_GET['p'], time()))) {
        @mail(TEAM_MAIL,
            'New Transcript user registration',
            $_GET['r'].' has just registered for the Transcript platform and requires manual activation. You may activate the account by using this link: '.MAIN_URL.'/api/?activate='.rawurlencode(md5($_GET['r'])),
            'From: '.TEAM_MAIL."\r\n".'X-Mailer: PHP/' . phpversion());
        die('{"message":"Registration complete. Please wait until a team member has manually activated your account."}');
    } else {
        die('{"message":"Registration unsuccessful"}');
    }
} else {
    die('{"error":"Login unsuccessful"}');
}
