<?php

require_once('../config.php');
if(isset($_GET['p']) && strtolower($_GET['p']) === PASSWORD_HASH) {
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