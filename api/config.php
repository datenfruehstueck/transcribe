<?php

define('DB_HOST', 'localhost');
define('DB_USER', 'your_database_user');
define('DB_PASSWORD', 'your_database_password');
define('DB_DATABASE', 'your_database');



/**
 * Do not change below here.
 * 
 * This function checks whether the submitted credentials allow access.
 * @param object database object to work with
 * @return number logged in user ID or NULL if not allowed
 */
function login(&$_oDb) {
    $nLogin = NULL;
    if(isset($_GET['p']) && isset($_GET['u'])) {
        if(($oResult = $_oDb->query(sprintf('SELECT nUseId FROM `user` WHERE bActive AND sMail = \'%s\' AND sPassword = \'%s\'', $_GET['u'], $_GET['p'])))) {
            if($oResult->num_rows == 1) {
                $aUser = $oResult->fetch_assoc();
                $nLogin = $aUser['nUseId'];
                unset($_GET['u']);
                unset($_GET['p']);
                $_oDb->query(sprintf('UPDATE `user` SET dLastAction = %d WHERE nUseId = %d', time(), $nLogin));
            }
        }
    }
    return $nLogin;
}
