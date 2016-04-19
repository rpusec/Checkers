<?php

require_once('../libs/meekrodb.2.3.class.php');

/**
 * Handles all of the database related operations regarding messages and users. 
 * @see [http://meekro.com/] Documentation on meekrodb library. 
 * @author Roman Pusec
 */
class MessageDBHandler
{
	/**
	 * Deletes old messages whose exparation date has passed. 
	 * @param  [Number] $currTimeInSec The specified current time. 
	 */
	public static function deleteOldMessages($currTimeInSec){
		DB::delete('message', 'exparation<%i', $currTimeInSec);
	}

	/**
	 * Returns message information alongside user information. 
	 * @return [Array] Array of messages and users. 
	 */
	public static function getMessagesWithUsers(){
		return DB::query(
			'SELECT messageID, ' .
			'user.userID as userID, ' .
			'user.FName as firstName, ' .
			'user.LName as lastName, ' .
			'message, ' .
			'exparation, ' .
			'user.chatColorR as chatColorR, ' . 
			'user.chatColorG as chatColorG, ' . 
			'user.chatColorB as chatColorB ' . 
			'FROM message JOIN user ON (user.userID = message.USER_UserID)');
	}

	/**
	 * Inserts a new message to the database. 
	 * @param  [Integer] $userID           The ID of the user. 
	 * @param  [String] $message          The message itself.
	 * @param  [Number] $currentTimeInSec The current time in seconds. 
	 */
	public static function insertMessage($userID, $message, $currentTimeInSec){
		DB::insert('message', array(
			'USER_userID' => $userID, 
			'message' => htmlspecialchars($message),
			'exparation' => '' . ($currentTimeInSec + MESSAGE_EXPARATION_TIME)
		));
	}
}