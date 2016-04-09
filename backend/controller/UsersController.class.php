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
	const SEARCH_BY_ID = 1;
	const SEARCH_BY_USERNAME = 2;

	/**
	 * Returns a user by their ID. 
	 * @param  Integer $userID The user ID. 
	 * @return Array Success flag, whether the user was found. 
	 */
	public static function getUserByID($userID)
	{
		parent::startConnection();
		$results = DB::query('SELECT fname as firstname, lname as lastname, username FROM user WHERE userID = %i', $userID);

		if(!empty($results))
			return array('success' => true, 'user' => $results[0]);

		return array('success' => false);
	}

	/**
	 * Registers users to the database. If a field is an empty string, then it 
	 * is not included in the update statement. 
	 * @see 'checkIfLoggedAndInputNotEmpty' function. 
	 * @param  String $firstname First name of the user. 
	 * @param  String $lastname  Last name of the user. 
	 * @param  String $username  User's username. 
	 * @param  String $password  User's password. 
	 * @return Array             Success flag, indicating whether the user was added to the database. In other case, it may also return a list of errors. 
	 */
	public static function registerUser($firstname, $lastname, $username, $password, $passwordConfirm)
	{
		parent::startConnection();
		
		if(self::checkIfLoggedAndInputNotEmpty($username))
		{
			ValidationHelper::checkAppropriateInputLength($username, MIN_USERNAME_INPUT_SIZE, MAX_USERNAME_INPUT_SIZE, 'Username');
			ValidationHelper::validateInput($username, 'crossSiteScriptingParanoid', ILLEGAL_INPUT_ERROR_MSG_PART . 'username. ', true);
			DB::query("SELECT userID FROM user WHERE username=%s", $username);
			if(DB::count() > 0)
				ValidationHelper::addError(USERNAME_NOT_UNIQUE_ERROR_MSG);
		}

		if(self::checkIfLoggedAndInputNotEmpty($password))
		{
			ValidationHelper::checkAppropriateInputLength($password, MIN_PASSWORD_INPUT_SIZE, MAX_PASSWORD_INPUT_SIZE, 'Password');
			ValidationHelper::checkIfEqual($password, $passwordConfirm, 'password', 'password confirm');
			ValidationHelper::validateInput($password, 'crossSiteScriptingParanoid', ILLEGAL_INPUT_ERROR_MSG_PART . 'password. ', true);
		}

		if(self::checkIfLoggedAndInputNotEmpty($firstname))
		{
			ValidationHelper::checkAppropriateInputLength($firstname, MIN_FNAME_INPUT_SIZE, MAX_FNAME_INPUT_SIZE, 'First name');
			ValidationHelper::validateInput($firstname, 'alphabeticSpace', 'First name' . ALPHABETIC_ERROR_MSG_PART);
			ValidationHelper::validateInput($firstname, 'crossSiteScriptingParanoid', ILLEGAL_INPUT_ERROR_MSG_PART . 'first name. ', true);
		}

		if(self::checkIfLoggedAndInputNotEmpty($lastname))
		{
			ValidationHelper::checkAppropriateInputLength($lastname, MIN_LNAME_INPUT_SIZE, MAX_LNAME_INPUT_SIZE, 'Last name');
			ValidationHelper::validateInput($lastname, 'alphabeticSpace', 'Last name' . ALPHABETIC_ERROR_MSG_PART);	
			ValidationHelper::validateInput($lastname, 'crossSiteScriptingParanoid', ILLEGAL_INPUT_ERROR_MSG_PART . 'last name. ', true);
		}					

		if(ValidationHelper::hasErrors())
			return array('success' => false, 'errors' => ValidationHelper::getErrors());

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

			//includes only the parameters that aren't an empty string 
			if(!empty($arrUpdate))
				DB::update('user', $arrUpdate, "userID=%i", parent::getLoggedUserID());
		}

		return array(
			'success' => true
		);
	}

	/**
	 * Checking if the user is logged since only then they can alter their information. 
	 *
	 * Since our aim is to evaluate only the input fields that were provided by the authenticated user,
	 * the function should return true if the input field isn't empty, since in that case we should 
	 * conduct input validation. Otherwise, it would return false since then the validation wouldn't be necessary 
	 * since the fields would not be included in the update statement of the self::registerUser() function.
	 * 
	 * @param Boolean $input True if the user is logged in and input isn't an empty string, false otherwise. 
	 */
	private static function checkIfLoggedAndInputNotEmpty($input){
		if(parent::isUserLogged())
		{
			if($input != '')
				return true;
			return false;
		}
		
		return true;
	}

	/**
	 * Logs the user in. 
	 *
	 * This function checks for a number of things. It checks first for cross site scripting value inputs. 
	 * It then updates the user's connection exparation date, to see if the user's connection had expired. 
	 * After it had searched for the user, it checks if the user's connection value from the database returned
	 * true, that would mean that there's a high probability that the user is already logged in from another session. 
	 * It then updates user's chat color to a different one if the authentication process has passed. 
	 * 
	 * @param  String $username User's username. 
	 * @param  String $password User's password.
	 * @return Array            Array with a flag, indicating whether the authentication procedure was successful. It also includes user chat bubble colors. 
	 */
	public static function loginUser($username, $password)
	{
		ValidationHelper::validateInput($username, 'crossSiteScriptingParanoid', ILLEGAL_INPUT_ERROR_MSG_PART . 'username. ', true);
		ValidationHelper::validateInput($password, 'crossSiteScriptingParanoid', ILLEGAL_INPUT_ERROR_MSG_PART . 'password. ', true);

		if(ValidationHelper::hasErrors())
			return array('success' => false, 'errors' => ValidationHelper::getErrors());

		parent::startConnection();
		self::updateAllUserConnStat($username, self::SEARCH_BY_USERNAME);
		$results = DB::query("SELECT userID, username, password, connected FROM user WHERE username = %s AND password = %s", $username, $password);
		$flag = false;

		if(count($results) === 1)
		{
			$targetUser = $results[0];

			if(intval($targetUser['connected']) === 1)
				return array('success' => false, 'errors' => array(ALREADY_CONNECTED_ERROR_MSG));

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
				parent::setLoggedUser($targetUser['userID']);
				$flag = true;
			}
		}

		$arrReturn = array();
		$arrReturn['success'] = $flag;

		if(isset($arrRandColor))
			$arrReturn['arrUserColor'] = $arrRandColor;

		return $arrReturn;
	}

	/**
	 * Gets the list of all online users from the database. 
	 * @return Array List of connected users, success flag, and the ID of the logged user. 
	 */
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
			'chatColorB, ' .
			'won, ' . 
			'lost ' . 
			'FROM user WHERE connected = 1');

		return array(
			'success' => true, 
			'connectedUsers' => $connectedUsers, 
			'loggedUserID' => parent::isUserLogged() ? parent::getLoggedUserID() : -1
		);
	}

	/**
	 * Checks whether the user is logged. This function is executed on startup. 
	 * The method first updates the authenticated user's connection status (based upon whether
	 * the user's connection has expired). It then checks if the user's connection indeed has expired
	 * (that would happen if the user has not been playing the game in a long time), in that case, 
	 * the user's session is destroyed. 
	 * @return Array Array which contains a flag, indicating whether the user is logged or not. 
	 */
	public static function isUserLogged(){
		if(parent::isUserLogged())
		{
			self::updateAllUserConnStat(parent::getLoggedUserID()); 
			$results = DB::query('SELECT connected, chatColorR, chatColorG, chatColorB FROM user WHERE userID = %i', parent::getLoggedUserID());

			DB::update('user', array('ROOM_roomID' => 0), 'userID=%i', parent::getLoggedUserID());

			if(!empty($results))
			{
				$user = $results[0];
				if($user['connected'] == 0)
					parent::destroySession();
			}
		}

		$arrReturn = array();
		$arrReturn['isLogged'] = parent::isUserLogged();

		if(isset($results) && count($results) === 1 && parent::isUserLogged())
			$arrReturn['arrUserColor'] = array(
				'red' => $results[0]['chatColorR'],
				'green' => $results[0]['chatColorG'],
				'blue' => $results[0]['chatColorB']
			);

		return $arrReturn;
	}

	/**
	 * Logs the user out. 
	 * @return Array A two item array, with a success flag, indicating whether the user was logged out, and a message explaining the user's logout status. 
	 */
	public static function logoutUser($destroySession=true)
	{
		if(!parent::isUserLogged())
			return array('success' => false, 'message' => USER_LOGOUT_ERROR_MSG);

		parent::startConnection();

		DB::update('user', array(
			'connected' => 0,
			'ROOM_roomID' => 0
		), 'userID=%i', parent::getLoggedUserID());

		if($destroySession)
			parent::destroySession();
		
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
		), 'userID=%i', ($userID === null ? parent::getLoggedUserID() : $userID));

		return array('success' => true);
	}

	/**
	 * Marks all users as 'disconnected' whose connection has expired. 
	 * @see the class description. 
	 */
	public static function updateAllUserConnStat($credential = null, $searchBy = self::SEARCH_BY_ID)
	{
		parent::startConnection();
		DB::update('user', array('connected' => 0, 'ROOM_roomID' => 0), 'connexparation<%i' . ($credential !== null ? ' AND ' . ($searchBy === self::SEARCH_BY_ID ? 'userID=%i' : 'username=%s') : ''), parent::getTimeInSec(), $credential);
		return array('success' => true);
	}

	/**
	 * Generates a random color for the chat personnel. 
	 * This algorithm does not provide generation of dark 
	 * colors (e.g. if $brightness is set to 0, then the 
	 * color would be exactly between bright and dark). 
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
				self::proccessRandomizedColors($colors, 'blue', 'green', $brightness);
				break;
			case GRC_GREEN : 
				$colors['green'] = $brightness;
				self::proccessRandomizedColors($colors, 'red', 'blue', $brightness);
				break;
			case GRC_BLUE : 
				$colors['blue'] = $brightness;
				self::proccessRandomizedColors($colors, 'red', 'green', $brightness);
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
	private static function proccessRandomizedColors(&$colors, $color1, $color2, $brightness){
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
	}
}