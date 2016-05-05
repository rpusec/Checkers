<?php

require_once('../config/constants.php');
require_once('validation/UserValidator.class.php');
require_once('dbhandler/UserDBHandler.php');

/**
 * Handles all of the logic associated with users. 
 * @author  Roman Pusec
 */
class UserLogic
{
	/**
	 * Checks for all of the user input errors associated with the registration or user settings process. 
	 * @param [Boolean] $isUserLogged    Is the user logged in. 
	 * @param [Integer] $loggedUserID    The ID of the logged user. 
	 * @param [String] $firstname        The new value for firstname. 
	 * @param [String] $lastname         The new value for lastname. 
	 * @param [String] $username         The new value for username. 
	 * @param [String] $password         The new value for password. 
	 * @return [Array]                   If there are any errors, it'll return an array with a success flag as false, and the list of errors, otherwise it'll return null.
	 */
	public static function checkForUserInputErrors($isUserLogged, $firstname, $lastname, $username, $password, $passwordConfirm){
		if(self::checkIfLoggedAndInputNotEmpty($username, $isUserLogged))
		{
			UserValidator::checkAppropriateInputLength($username, MIN_USERNAME_INPUT_SIZE, MAX_USERNAME_INPUT_SIZE, 'Username');
			UserValidator::validateSSXParanoidInput($username, ILLEGAL_INPUT_ERROR_MSG_PART . 'username. ');
			UserValidator::checkIfUsernameExists($username);
		}

		if(self::checkIfLoggedAndInputNotEmpty($password, $isUserLogged))
		{
			UserValidator::checkAppropriateInputLength($password, MIN_PASSWORD_INPUT_SIZE, MAX_PASSWORD_INPUT_SIZE, 'Password');
			UserValidator::checkIfEqual($password, $passwordConfirm, 'password', 'password confirm');
			UserValidator::validateSSXParanoidInput($password, ILLEGAL_INPUT_ERROR_MSG_PART . 'password. ');
		}

		if(self::checkIfLoggedAndInputNotEmpty($firstname, $isUserLogged))
		{
			UserValidator::checkAppropriateInputLength($firstname, MIN_FNAME_INPUT_SIZE, MAX_FNAME_INPUT_SIZE, 'First name');
			UserValidator::validateAlphabeticSpaceInput($firstname, 'First name' . ALPHABETIC_ERROR_MSG_PART);
			UserValidator::validateSSXParanoidInput($firstname, ILLEGAL_INPUT_ERROR_MSG_PART . 'first name. ');
		}

		if(self::checkIfLoggedAndInputNotEmpty($lastname, $isUserLogged))
		{
			UserValidator::checkAppropriateInputLength($lastname, MIN_LNAME_INPUT_SIZE, MAX_LNAME_INPUT_SIZE, 'Last name');
			UserValidator::validateAlphabeticSpaceInput($lastname, 'Last name' . ALPHABETIC_ERROR_MSG_PART);	
			UserValidator::validateSSXParanoidInput($lastname, ILLEGAL_INPUT_ERROR_MSG_PART . 'last name. ');
		}					

		if(UserValidator::hasErrors())
			return array('success' => false, 'errors' => UserValidator::getErrors());
		return null;
	}

	/**
	 * Handles the logic for adding (registering) users or editing their information. Information 
	 * that's equivalent to an empty string is not included in the update query. 
	 * @param [Boolean] $isUserLogged    Is the user logged in. 
	 * @param [Integer] $loggedUserID    The ID of the logged user. 
	 * @param [String] $firstname        The new value for firstname. 
	 * @param [String] $lastname         The new value for lastname. 
	 * @param [String] $username         The new value for username. 
	 * @param [String] $password         The new value for password. 
	 * @param [String] $passwordConfirm  Retyped password. 
	 */
	public static function addOrEditUser($isUserLogged, $loggedUserID, $firstname, $lastname, $username, $password, $passwordConfirm){
		if(!$isUserLogged)
		{
			UserDBHandler::insertUser($firstname, $lastname, $username, $password);
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
				UserDBHandler::updateUser($arrUpdate, $loggedUserID);
		}
	}

	/**
	 * Handles the login logic. 
	 * @param  [type] $targetUser    The target user directly fetched from the database. 
	 * @param  [type] $username      The inputed username. 
	 * @param  [type] $password      The inputed password. 
	 * @param  [type] &$flag         Flag determining whether the login was successful or not. 
	 * @param  [type] &$arrRandColor Will reference the randomly generated color. 
	 */
	public static function handleLogin($targetUser, $username, $password, &$flag, &$arrRandColor){
		if(intval($targetUser['connected']) === 1)
			return array('success' => false, 'errors' => array(ALREADY_CONNECTED_ERROR_MSG));

		if($targetUser['username'] === $username && $targetUser['password'] === $password)
		{
			$arrRandColor = self::getRandomColor(CHAT_COLOR_BRIGHTNESS);
			UserDBHandler::updateUserColors($arrRandColor['red'], $arrRandColor['green'], $arrRandColor['blue'], $targetUser['userID']);
			$flag = true;
		}

		return null;
	}

    /**
	 * Generates a random color for the chat personnel. 
	 * This algorithm does not provide generation of dark 
	 * colors (e.g. if $brightness is set to 0, then the 
	 * color would be exactly between bright and dark). 
	 * @param  Integer $brightness 	Determines the actual brightness, can be from 0 up to 255. 
	 * @return Array 				An associative array object which contains randomized red, green, and blue color combinations items.             
	 */
	public static function getRandomColor($brightness){
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
	private static function checkIfLoggedAndInputNotEmpty($input, $isUserLogged){
		if($isUserLogged)
		{
			if($input != '')
				return true;
			return false;
		}
		
		return true;
	}

	/**
	 * Marks the user as not in a present room. 
	 * @param  [Integer] $userID The target user ID. 
	 */
	public static function updateUserAsNotInARoom($userID){
		UserDBHandler::updateUserAsNotInARoom($userID);
	}

	/**
	 * Marks the user as disconnected in the database. 
	 * @param  [Integer] $userID The target user ID. 
	 */
	public static function updateUserAsDisconnected($userID){
		UserDBHandler::updateUserAsDisconnected($userID);
	}

	/**
	 * Updates the connection time of a particular user. 
	 * @param  [Number] $timeInSeconds The current time in seconds. 
	 * @param  [Integer] $userID       The target user ID. 
	 */
	public static function updateConnectionTime($timeInSeconds, $userID){
		UserDBHandler::updateConnectionTime($timeInSeconds, $userID);
	}

	/**
	 * Marks appropiate users as disconnected based on their connection exparation date. 
	 * @param  [type] $timeInSeconds Current time in seconds. 
	 * @param  [type] $credential    The name of the credential to search by. 
	 * @param  [type] $searchBy      The credential to search by. If value not specified, it won't search by any credential.
	 */
	public static function markAppropriateUsersAsDisconnected($timeInSeconds, $credential = null, $searchBy = null){
		UserDBHandler::markAppropriateUsersAsDisconnected($timeInSeconds, $credential, $searchBy === null ? UserDBHandler::SEARCH_BY_ID : $searchBy);
	}

	/**
	 * Fetches a user by their username and password. 
	 * @param  [String] $username Username value. 
	 * @param  [String] $password Password value. 
	 * @return [Array]            The user, directly fetched from the database. 
	 */
	public static function getUserByUsernameAndPassword($username, $password){
		return UserDBHandler::getUserByUsernameAndPassword($username, $password);
	}

	/**
	 * Returns all connected users. 
	 * @return [Array] Array of connected users. 
	 */
	public static function getAllConnectedUsers(){
		return UserDBHandler::getAllConnectedUsers();
	}

	/**
	 * Returns the connection state and the RGB colors of a particular user. 
	 * @param  [Integer] $userID The ID of the user. 
	 * @return [Array] The user's said information. 
	 */
	public static function getConnStatAndColorsFromUser($userID){
		return UserDBHandler::getConnStatAndColorsFromUser($userID);
	}

	public static function getConnStatFromUser($userID){
		$user = UserDBHandler::getUserByID($userID);

		if($user !== null)
			return $user['connected'];
		return null;
	}
}