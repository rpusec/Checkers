<?php

require_once('BaseController.class.php');

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
	public static function registerUser($firstname, $lastname, $username, $password)
	{
		parent::startConnection();

		DB::insert('user', array(
			'fname' => $firstname,
			'lname' => $lastname,
			'username' => $username,
			'password' => $password
		));

		return array(
			'affectedRows' => DB::affectedRows()
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
					'chatColorB' => $arrRandColor['blue']
				), $targetUser['userID']);

				session_start();
				$_SESSION["userID"] = $targetUser['userID'];
				$flag = true;
			}
		}

		return array('success' => $flag);
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

				if(rand(0, 1) === 0)
				{
					$colors['green'] = rand($brightness, 255);
					$colors['blue'] = 255;
				}
				else
				{
					$colors['blue'] = rand($brightness, 255);
					$colors['green'] = 255;
				}

				break;
				
			case GRC_GREEN : 
				$colors['green'] = $brightness;

				if(rand(0, 1) === 0)
				{
					$colors['red'] = rand($brightness, 255);
					$colors['blue'] = 255;
				}
				else
				{
					$colors['blue'] = rand($brightness, 255);
					$colors['red'] = 255;
				}

				break;
			case GRC_BLUE : 
				$colors['blue'] = $brightness;

				if(rand(0, 1) === 0)
				{
					$colors['red'] = rand($brightness, 255);
					$colors['green'] = 255;
				}
				else
				{
					$colors['green'] = rand($brightness, 255);
					$colors['red'] = 255;
				}

				break;
		}

		return $colors;
	}
}