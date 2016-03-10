<?php

require_once('BaseController.class.php');

/**
 * Controller class for chat functionality. 
 * @author Roman Pusec
 */
class ChatController extends BaseController
{
	/**
	 * Adds a message to the database. 
	 * @see constants.php for the EXPARATION_TIME constant.
	 * @param String $message Target user's message. 
	 */
	public static function addMessage($message)
	{
		if(!parent::isUserLogged())
			return array('success' => false, 'error' => CANNOT_SEND_MESSAGES);

		parent::startConnection();
		$userID = $_SESSION['userID'];

		DB::insert('message', array(
			'USER_userID' => $userID, 
			'message' => $message,
			'exparation' => "" . (parent::getTimeInSec() + EXPARATION_TIME)
		));

		return array(
			'success' => true,
			'affectedRows' => DB::affectedRows()
		);
	}

	/**
	 * Retrieves all of the messages from the database. 
	 * @return Array An array object which contains all of the messages. 
	 */
	public static function getMessages(){
		if(!parent::isUserLogged())
			return array('success' => false, 'error' => CANNOT_RETRIEVE_MESSAGES);

		parent::startConnection();
		self::deleteOldMessages();

		$results = DB::query(
			'SELECT messageID, ' .
			'user.FName as firstName, ' .
			'user.LName as lastName, ' .
			'message, ' .
			'exparation, ' .
			'user.chatColorR as chatColorR, ' . 
			'user.chatColorG as chatColorG, ' . 
			'user.chatColorB as chatColorB ' . 
			'FROM message JOIN user ON (user.userID = message.USER_UserID)');

		return array(
			'success' => true, 
			'messages' => $results
		);
	}

	/**
	 * Erases the old messages. 
	 * @see constants.php for the EXPARATION_TIME constant. 
	 */
	private static function deleteOldMessages(){
		DB::delete('message', 'exparation<%i', parent::getTimeInSec());
	}
}