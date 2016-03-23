<?php

require_once('../connparams.php');
require_once('../libs/meekrodb.2.3.class.php');
require_once('../common/constants.php');

/**
 * Class which offers functions shared by all controller subtypes. 
 * It also includes functions for checking if the user is authenticated 
 * in the application and also offers a function to set the ID of the 
 * authenticated user. 
 *
 * Since checkers is a two player game, the controller also offers two
 * functions to set and get player number. The player number attribute
 * identifies the user either as the first or the second player
 * in the game, which is useful since the client side has to know 
 * whether the user is the second or the first player. The value of
 * this attribute is stored in session rather than in the database. 
 * 
 * @author Roman Pusec
 */
class BaseController
{
	/**
	 * Sets up connection parameters for meekrodb. 
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

	/**
	 * Setting a user as authenticated. 
	 * @param Integer $userID The ID of the user from the database. 
	 */
	public static function setLoggedUser($userID){
		$_SESSION['userID'] = $userID;
	}

	/**
	 * Returns the ID of the logged user. 
	 * @return Integer The ID of the logged user. 
	 */
	public static function getLoggedUserID(){
		return $_SESSION['userID'];
	}

	/**
	 * Identifies whether this user is the first or the second
	 * player in the game. Use FIRST_PLAYER constant to identify target user
	 * as the first player, and SECOND_PLAYER as the second player. 
	 * @param [Integer] $num The number of the player. Use appropriate constants for this property. 
	 */
	public static function setPlayerNumber($num){
		$_SESSION['playerNumber'] = $num;
	}

	/**
	 * Returns the player number of this user. 
	 * @return [Integer] The player number. 
	 */
	public static function getPlayerNumber(){
		return $_SESSION['playerNumber'];
	}

	/**
	 * Deletes the playerNumber session variable. 
	 */
	public static function removePlayerNumber(){
		unset($_SESSION['playerNumber']);
	}
}