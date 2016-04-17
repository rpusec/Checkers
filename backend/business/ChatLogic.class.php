<?php

require_once('../config/constants.php');
require_once('validation/UserValidator.class.php');
require_once('dbhandler/ChatDBHandler.php');

/**
 * Offers all of the business rules 
 * associated with the chat functionality. 
 * @author Roman Pusec 
 */
class ChatLogic
{
	/**
	 * Checks the appropriate chat input length. 
	 * @param  [String] $message The user's message. 
	 * @return [Array]           In case there were errors, returns an array with success flag as false and the error itself. 
	 */
	public static function checkAppropriateInputLength($message){
		UserValidator::checkAppropriateInputLength($message, MIN_MESSAGE_SIZE, MAX_MESSAGE_SIZE, 'message');

		if(UserValidator::hasErrors())
			return array(
				'success' => false,
				'errors' => UserValidator::getErrors()
		);

		return null;
	}

	public static function insertMessage($userID, $message, $currentTimeInSec){
		ChatDBHandler::insertMessage($userID, $message, $currentTimeInSec);
	}

	public static function getMessagesWithUsers(){
		return ChatDBHandler::getMessagesWithUsers();
	}

	public static function deleteOldMessages($currentTimeInSec){
		ChatDBHandler::deleteOldMessages($currentTimeInSec);
	}
}