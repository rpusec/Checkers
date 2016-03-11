<?php

require_once('BaseController.class.php');
require_once('../helper/ValidationHelper.class.php');

/**
 * Handles functionality for users. 
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
		ValidationHelper::checkAppropriateInputLength($username, MIN_USERNAME_INPUT_SIZE, MAX_USERNAME_INPUT_SIZE, 'Username');
		ValidationHelper::checkAppropriateInputLength($password, MIN_PASSWORD_INPUT_SIZE, MAX_PASSWORD_INPUT_SIZE, 'Password');
		
		ValidationHelper::checkAppropriateInputLength($firstname, MIN_FNAME_INPUT_SIZE, MAX_FNAME_INPUT_SIZE, 'First name');
		ValidationHelper::checkAppropriateInputLength($lastname, MIN_LNAME_INPUT_SIZE, MAX_LNAME_INPUT_SIZE, 'Last name');

		ValidationHelper::validateInput($firstname, 'alphabeticSpace', 'First name' . ALPHABETIC_ERROR_MSG_PART);
		ValidationHelper::validateInput($lastname, 'alphabeticSpace', 'Last name' . ALPHABETIC_ERROR_MSG_PART);
		
		ValidationHelper::checkIfEqual($password, $passwordConfirm, 'password', 'password confirm');

		if(ValidationHelper::hasErrors())
			return array('success' => false, 'errors' => ValidationHelper::getErrors());

		parent::startConnection();
		DB::insert('user', array(
			'fname' => $firstname,
			'lname' => $lastname,
			'username' => $username,
			'password' => $password
		));

		return array(
			'success' => true
		);
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
		), 'userID=%i', $_SESSION['userID']);

		unset($_SESSION["userID"]);
		return array('success' => true, 'message' => USER_LOGOUT_MSG);
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