<?php

require_once('../config.php');
$oDb = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE);
$oDb->query('SET NAMES utf8');
$nLogin = login($oDb);
if($nLogin !== NULL && $nLogin > 0) {
    if(!empty($_GET['f']) && !preg_match('=/=', $_GET['f'])) {
        if(file_exists($_GET['f'])) {
            $oFileInfo = finfo_open(FILEINFO_MIME_TYPE);
            header('Content-Type: '.finfo_file($oFileInfo, $_GET['f']));
            finfo_close($oFileInfo);
            header('Content-Disposition: attachment; filename="'.$_GET['f'].'"');
            readfile($_GET['f']);
        } else {
            die('Bad request.');
        }
    } else {
        die('Bad request.');
    }
} else {
    die('Bad request.');
}

?>