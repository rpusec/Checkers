<?php

require_once('../config/constants.php');
require_once('validation/UserValidator.class.php');
require_once('dbhandler/MessageDBHandler.php');
require_once('dbhandler/RoomDBHandler.php');

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

	/**
	 * Inserts a new message to the database. 
	 * @param  [Integer] $userID           The ID of the user. 
	 * @param  [String] $message          The message itself.
	 * @param  [Number] $currentTimeInSec The current time in seconds. 
	 */
	public static function insertMessage($userID, $message, $currentTimeInSec){
		$room = RoomDBHandler::getRoomIDFromUser($userID);
		MessageDBHandler::insertMessage($userID, $room !== null ? $room['roomID'] : null, htmlspecialchars($message), $currentTimeInSec);
	}

	/**
	 * Returns message information alongside user information. 
	 * @return [Array] Array of messages and users. 
	 */
	public static function getMessagesWithUsers($userID){
		$room = RoomDBHandler::getRoomIDFromUser($userID);
		return MessageDBHandler::getMessagesWithUsers($room !== null ? $room['roomID'] : null);
	}

	/**
	 * Deletes old messages whose exparation date has passed. 
	 * @param  [Number] $currTimeInSec The specified current time. 
	 */
	public static function deleteOldMessages($currentTimeInSec){
		MessageDBHandler::deleteOldMessages($currentTimeInSec);
	}
}