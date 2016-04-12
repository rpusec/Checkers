<?php

class UserLogic
{
	public static function checkForUserInputErrors(){
		if(self::checkIfLoggedAndInputNotEmpty($username))
		{
			UserValidator::checkAppropriateInputLength($username, MIN_USERNAME_INPUT_SIZE, MAX_USERNAME_INPUT_SIZE, 'Username');
			UserValidator::validateSSXParanoidInput($username, ILLEGAL_INPUT_ERROR_MSG_PART . 'username. ');
			UserValidator::checkIfUsernameExists($username);
		}

		if(self::checkIfLoggedAndInputNotEmpty($password))
		{
			UserValidator::checkAppropriateInputLength($password, MIN_PASSWORD_INPUT_SIZE, MAX_PASSWORD_INPUT_SIZE, 'Password');
			UserValidator::checkIfEqual($password, $passwordConfirm, 'password', 'password confirm');
			UserValidator::validateSSXParanoidInput($password, ILLEGAL_INPUT_ERROR_MSG_PART . 'password. ');
		}

		if(self::checkIfLoggedAndInputNotEmpty($firstname))
		{
			UserValidator::checkAppropriateInputLength($firstname, MIN_FNAME_INPUT_SIZE, MAX_FNAME_INPUT_SIZE, 'First name');
			UserValidator::validateAlphabeticSpaceInput($firstname, 'First name' . ALPHABETIC_ERROR_MSG_PART);
			UserValidator::validateSSXParanoidInput($firstname, ILLEGAL_INPUT_ERROR_MSG_PART . 'first name. ');
		}

		if(self::checkIfLoggedAndInputNotEmpty($lastname))
		{
			UserValidator::checkAppropriateInputLength($lastname, MIN_LNAME_INPUT_SIZE, MAX_LNAME_INPUT_SIZE, 'Last name');
			UserValidator::validateAlphabeticSpaceInput($lastname, 'Last name' . ALPHABETIC_ERROR_MSG_PART);	
			UserValidator::validateSSXParanoidInput($lastname, ILLEGAL_INPUT_ERROR_MSG_PART . 'last name. ');
		}					

		if(UserValidator::hasErrors())
			return array('success' => false, 'errors' => UserValidator::getErrors());
		return null;
	}

	public static function addOrEditUser($isUserLogged, $loggedUserID, $firstname, $lastname, $username, $password, $passwordConfirm){
		if(!$isUserLogged)
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
				DB::update('user', $arrUpdate, "userID=%i", $loggedUserID);
		}
	}

	public static function handleLogin($targetUser, $username, $password, &$flag){
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
	private static function checkIfLoggedAndInputNotEmpty($input){
		if(parent::isUserLogged())
		{
			if($input != '')
				return true;
			return false;
		}
		
		return true;
	}
}
