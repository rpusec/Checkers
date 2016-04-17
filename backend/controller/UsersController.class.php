<?php

require_once('BaseController.class.php');
require_once('../business/UserLogic.class.php');

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
	 * Returns a user by their ID. 
	 * @param  Integer $userID The user ID. 
	 * @return Array Success flag, whether the user was found. 
	 */
	public static function getUserByID($userID)
	{
		parent::startConnection();

		$targetUser = UserDBHandler::getUserByID($userID);
		if($targetUser !== null)
			return array('success' => true, 'user' => $targetUser);

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

		$inputValidationErrors = UserLogic::checkForUserInputErrors(parent::isUserLogged(), $firstname, $lastname, $username, $password, $passwordConfirm);
		if(is_array($inputValidationErrors))
			return $inputValidationErrors;

		UserLogic::addOrEditUser(parent::isUserLogged(), parent::getLoggedUserID(), $firstname, $lastname, $username, $password, $passwordConfirm);

		return array(
			'success' => true
		);
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
		parent::startConnection();
		self::updateAllUserConnStat($username, UserDBHandler::SEARCH_BY_USERNAME);
		$targetUser = UserLogic::getUserByUsernameAndPassword($username, $password);
		$flag = false;
		$arrRandColor = null;

		if($targetUser !== null)
		{
			$handleLoginRes = UserLogic::handleLogin($targetUser, $username, $password, $flag, $arrRandColor);
			if(is_array($handleLoginRes))
				return $handleLoginRes;

			if($flag)
			{
				self::updateConnTime($targetUser['userID']);
				parent::setLoggedUser($targetUser['userID']);
			}
		}

		$arrReturn = array();
		$arrReturn['success'] = $flag;

		if($arrRandColor !== null)
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
		return array(
			'success' => true, 
			'connectedUsers' => UserLogic::getAllConnectedUsers(), 
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
			$targetUser = UserLogic::getConnStatAndColorsFromUser(parent::getLoggedUserID());
			UserLogic::updateUserAsNotInARoom(parent::getLoggedUserID());

			if($targetUser !== null)
			{
				if($targetUser['connected'] == 0)
					parent::destroySession();
			}
		}

		$arrReturn = array();
		$arrReturn['isLogged'] = parent::isUserLogged();

		if(isset($targetUser) && $targetUser !== null && parent::isUserLogged())
			$arrReturn['arrUserColor'] = array(
				'red' => $targetUser['chatColorR'],
				'green' => $targetUser['chatColorG'],
				'blue' => $targetUser['chatColorB']);

		return $arrReturn;
	}

	/**
	 * Logs the user out. 
	 * @param Boolean $destroySession Whether the session object should be destroyed. 
	 * @return Array A two item array, with a success flag, indicating whether the user was logged out, and a message explaining the user's logout status. 
	 */
	public static function logoutUser($destroySession=true)
	{
		if(!parent::isUserLogged())
			return array('success' => false, 'message' => USER_LOGOUT_ERROR_MSG);

		parent::startConnection();
		UserLogic::updateUserAsDisconnected(parent::getLoggedUserID());

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
		UserLogic::updateConnectionTime(parent::getTimeInSec(), parent::getLoggedUserID());
		return array('success' => true);
	}

	/**
	 * Marks all users as 'disconnected' whose connection has expired. 
	 * @see the class description. 
	 */
	public static function updateAllUserConnStat($credential = null, $searchBy = null)
	{
		parent::startConnection();
		UserLogic::markAppropriateUsersAsDisconnected(parent::getTimeInSec(), $credential, $searchBy);
		return array('success' => true);
	}
}