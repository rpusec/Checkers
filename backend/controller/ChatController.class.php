<?php

require_once('BaseController.class.php');
require_once('../business/ChatLogic.class.php');
require_once('../business/dbhandler/ChatDBHandler.php');

/**
 * Controller class for chat functionality. 
 * @author Roman Pusec
 */
class ChatController extends BaseController
{
	/**
	 * Adds a message to the database. 
	 * @see constants.php for the MESSAGE_EXPARATION_TIME constant.
	 * @param String $message Target user's message. 
	 */
	public static function addMessage($message)
	{
		if(!parent::isUserLogged())
			return array('success' => false, 'errorMessage' => CANNOT_SEND_MESSAGES);

		parent::startConnection();

		$output = ChatLogic::checkAppropriateInputLength($message);
		
		if(is_array($output))
			return $output;
		
		ChatDBHandler::insertMessage(parent::getLoggedUserID(), $message, parent::getTimeInSec());

		return array(
			'success' => true
		);
	}

	/**
	 * Retrieves all of the messages from the database. 
	 * @return Array An array object which contains all of the messages. 
	 */
	public static function getMessages(){
		if(!parent::isUserLogged())
			return array('success' => false, 'errorMessage' => CANNOT_RETRIEVE_MESSAGES);

		parent::startConnection();
		self::deleteOldMessages();

		return array(
			'success' => true, 
			'messages' => ChatDBHandler::getMessagesWithUsers(),
			'loggedUserID' => parent::getLoggedUserID()
		);
	}

	/**
	 * Erases the old messages. 
	 * @see constants.php for the EXPARATION_TIME constant. 
	 */
	private static function deleteOldMessages(){
		ChatDBHandler::deleteOldMessages();
	}
}