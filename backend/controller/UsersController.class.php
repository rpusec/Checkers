<?php

require_once('BaseController.class.php');
require_once('../helper/ValidationHelper.class.php');

/**
 * Handles functionality for users. 
 *
 * Each user has their own connection status and connection exparation date in the database. 
 * These two attributes are useful in the following manner:
 *  - Connection status makes it possible for other users to see if the said user is connected. 
 *  - Connection exparation date checks if the user's connection has expired (that is, if the user
 *  wasn't present on the web applicaiton for a specified amount of time). If it has expired, then
 *  the user will be marked as disconnected on the database, and the change will be propagated on
 *  other users' browsers through the help of AJAX on the frontend. 
 * 
 * @author Roman Pusec
 */
class UsersController extends BaseController
{
	/**
	 * Registers users to the database. 
	 * @param  String $firstname First name of the user. 
	 * @param  String $lastname  Last name of the user. 
	 * @param  String $username  User's username. 
	 * @param  String $password  User's password. 
	 * @return Array             Affected rows. 
	 */
	public static function registerUser($firstname, $lastname, $username, $password, $passwordConfirm)
	{
		if(self::checkIfLoggedAndInputNotEmpty($username))
			ValidationHelper::checkAppropriateInputLength($username, MIN_USERNAME_INPUT_SIZE, MAX_USERNAME_INPUT_SIZE, 'Username');
		
		if(self::checkIfLoggedAndInputNotEmpty($password))
			ValidationHelper::checkAppropriateInputLength($password, MIN_PASSWORD_INPUT_SIZE, MAX_PASSWORD_INPUT_SIZE, 'Password');
		
		if(self::checkIfLoggedAndInputNotEmpty($firstname))
			ValidationHelper::checkAppropriateInputLength($firstname, MIN_FNAME_INPUT_SIZE, MAX_FNAME_INPUT_SIZE, 'First name');
		
		if(self::checkIfLoggedAndInputNotEmpty($lastname))
			ValidationHelper::checkAppropriateInputLength($lastname, MIN_LNAME_INPUT_SIZE, MAX_LNAME_INPUT_SIZE, 'Last name');

		if(self::checkIfLoggedAndInputNotEmpty($firstname))
			ValidationHelper::validateInput($firstname, 'alphabeticSpace', 'First name' . ALPHABETIC_ERROR_MSG_PART);
		
		if(self::checkIfLoggedAndInputNotEmpty($lastname))
			ValidationHelper::validateInput($lastname, 'alphabeticSpace', 'Last name' . ALPHABETIC_ERROR_MSG_PART);
		
		if(self::checkIfLoggedAndInputNotEmpty($password))
			ValidationHelper::checkIfEqual($password, $passwordConfirm, 'password', 'password confirm');

		if(ValidationHelper::hasErrors())
			return array('success' => false, 'errors' => ValidationHelper::getErrors());

		parent::startConnection();

		if(!parent::isUserLogged())
		{
			DB::insert('user', array(
				'fname' => $firstname,
				'lname' => $lastname,
				'username' => $username,
				'password' => $password
			));
		}
		else
		{
			$arrUpdate = array();

			if($firstname != '')
				$arrUpdate['fname'] = $firstname;

			if($lastname != '')
				$arrUpdate['lname'] = $lastname;

			if($username != '')
				$arrUpdate['username'] = $username;

			if($password != '')
				$arrUpdate['password'] = $password;

			if(!empty($arrUpdate))
				DB::update('user', $arrUpdate, "userID=%i", parent::getLoggedUserID());
		}

		return array(
			'success' => true
		);
	}

	/**
	 * We're checking if the user is logged since only then they can alter their information. 
	 * 
	 * @param  [type] $input [description]
	 * @return [type]        [description]
	 */
	private static function checkIfLoggedAndInputNotEmpty($input){
		if(parent::isUserLogged() && $input != '')
			return true;
		return false;
	}

	/**
	 * Logs the user in. 
	 * @param  String $username User's username. 
	 * @param  String $password User's password.
	 * @return Array            Array with a flag, indicating whether the authentication procedure was successful. 
	 */
	public static function loginUser($username, $password)
	{
		//xss protection
		ValidationHelper::validateInput($username, 'crossSiteScriptingParanoid', ILLEGAL_INPUT_ERROR_MSG_PART . 'username. ', true);
		ValidationHelper::validateInput($password, 'crossSiteScriptingParanoid', ILLEGAL_INPUT_ERROR_MSG_PART . 'password. ', true);

		if(ValidationHelper::hasErrors())
			return array('success' => false, 'errors' => ValidationHelper::getErrors());

		parent::startConnection();
		$results = DB::query("SELECT userID, username, password FROM user WHERE username = %s AND password = %s", $username, $password);
		$flag = false;

		if(count($results) === 1)
		{
			$targetUser = $results[0];
			if($targetUser['username'] === $username && $targetUser['password'] === $password)
			{
				$arrRandColor = self::getRandomColor(CHAT_COLOR_BRIGHTNESS);

				//changes the user's chat colors upon login
				DB::update('user', array(
					'chatColorR' => $arrRandColor['red'],
					'chatColorG' => $arrRandColor['green'],
					'chatColorB' => $arrRandColor['blue'],
					'connected' => 1
				), 'userID=%i', $targetUser['userID']);
				
				self::updateConnTime($targetUser['userID']);

				$_SESSION["userID"] = $targetUser['userID'];
				$flag = true;
			}
		}

		return array('success' => $flag);
	}

	public static function getOnlineUsers()
	{
		parent::startConnection();
		$connectedUsers = DB::query(
			'SELECT userID, ' . 
			'fname as firstname, ' .
			'lname as lastname, ' .
			'username, ' .
			'chatColorR, ' .
			'chatColorG, ' .
			'chatColorB ' .
			'FROM user WHERE connected = 1');

		return array(
			'success' => true, 
			'connectedUsers' => $connectedUsers
		);
	}

	/**
	 * Checks whether the user is logged. 
	 * @return Array Array which contains a flag, indicating whether the user is logged or not. 
	 */
	public static function isUserLogged(){
		return array('isLogged' => parent::isUserLogged());
	}

	/**
	 * Logs the user out. 
	 * @return Array A two item array, with a success flag, indicating whether the user was logged out, and a message explaining the user's logout status. 
	 */
	public static function logoutUser()
	{
		if(!parent::isUserLogged())
			return array('success' => false, 'message' => USER_LOGOUT_ERROR_MSG);

		parent::startConnection();

		DB::update('user', array(
			'connected' => 0
		), 'userID=%i', parent::getLoggedUserID());

		unset($_SESSION["userID"]);
		return array('success' => true, 'message' => USER_LOGOUT_MSG);
	}

	/**
	 * Updates the connection time of this user. 
	 * @see the class description.  
	 */
	public static function updateConnTime($userID = null)
	{
		if($userID === null)
			if(!parent::isUserLogged())
				return array('success' => false);

		parent::startConnection();

		DB::update('user', array(
			'connexparation' => parent::getTimeInSec() + CONN_EXPARATION_TIME
		), 'userID=%i', ($userID === null ? parent::getLoggedUserID() : null));

		return array('success' => true);
	}

	/**
	 * Marks all users as 'disconnected' whose connection has expired. 
	 * @see the class description. 
	 */
	public static function updateAllUserConnStat()
	{
		parent::startConnection();
		DB::update('user', array('connected' => 0), 'connexparation<%i', parent::getTimeInSec());
		return array('success' => true);
	}

	/**
	 * Generates a random color for the chat personnel. 
	 * @param  Integer $brightness 	Determines the actual brightness, can be from 0 up to 255. 
	 * @return Array 				An associative array object which contains randomized red, green, and blue color combinations items.             
	 */
	private static function getRandomColor($brightness){
		define('GRC_RED', 1);
		define('GRC_GREEN', 2);
		define('GRC_BLUE', 3);

		//chooses which color (r|g|b) will be equivalent to the $brightness parameter 
		$nonRandomizedColor = rand(1, 3);
		$colors = array();

		switch($nonRandomizedColor){
			case GRC_RED : 
				$colors['red'] = $brightness;
				$colors = self::proccessRandomizedColors($colors, 'blue', 'green', $brightness);
				break;
			case GRC_GREEN : 
				$colors['green'] = $brightness;
				$colors = self::proccessRandomizedColors($colors, 'red', 'blue', $brightness);
				break;
			case GRC_BLUE : 
				$colors['blue'] = $brightness;
				$colors = self::proccessRandomizedColors($colors, 'red', 'green', $brightness);
				break;
		}

		return $colors;
	}

	/**
	 * Defines the randomized colors. 
	 * @param  Array  $colors Target array of all colors. 
	 * @param  String $color1 First color. 
	 * @param  String $color2 Second color. 
	 */
	private static function proccessRandomizedColors($colors, $color1, $color2, $brightness){
		if(rand(0, 1) === 0)
		{
			$colors[$color1] = rand($brightness, 255);
			$colors[$color2] = 255;
		}
		else
		{
			$colors[$color2] = rand($brightness, 255);
			$colors[$color1] = 255;
		}

		return $colors;
	}
}