<?php

require_once('../connparams.php');
require_once('../libs/meekrodb.2.3.class.php');
require_once('../common/constants.php');

class BaseController
{
	public static function startConnection(){
		DB::$user = DB_USER;
		DB::$password = DB_PASSWORD;
		DB::$dbName = DB_NAME;
	}

	public static function getTimeInSec(){
		list($currTimeDec, $currTimeInt) = explode(" ", microtime());
		$currTimeInt = (int) $currTimeInt;
		return $currTimeInt;
	}
}