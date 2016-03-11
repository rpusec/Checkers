<?php

require_once('../connparams.php');
require_once('../libs/meekrodb.2.3.class.php');
require_once('../common/constants.php');

/**
 * Class which offers functions shared by all controller subtypes. 
 * @author Roman Pusec
 */
class BaseController
{
	/**
	 * Sets up meekrodb's connection parameters. 
	 */
	public static function startConnection(){
		DB::$user = DB_USER;
		DB::$password = DB_PASSWORD;
		DB::$dbName = DB_NAME;
	}

	/**
	 * Returns current time in seconds. 
	 * @return Integer Current time in seconds. 
	 */
	public static function getTimeInSec(){
		list($currTimeDec, $currTimeInt) = explode(" ", microtime());
		$currTimeInt = (int) $currTimeInt;
		return $currTimeInt;
	}

	/**
	 * Checks whether the target user is logged. 
	 * @return boolean Flag indicating whether the user is logged in. 
	 */
	public static function isUserLogged(){
		return isset($_SESSION['userID']);
	}

	public static function getLoggedUserID(){
		return $_SESSION['userID'];
	}
}