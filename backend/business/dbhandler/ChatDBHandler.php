<?php

require_once('../libs/meekrodb.2.3.class.php');

class ChatDBHandler
{
	public static function deleteOldMessages($currTimeInSec){
		DB::delete('message', 'exparation<%i', $currTimeInSec);
	}

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

	public static function insertMessage($userID, $message, $currentTimeInSec){
		DB::insert('message', array(
			'USER_userID' => $userID, 
			'message' => htmlspecialchars($message),
			'exparation' => '' . ($currentTimeInSec + MESSAGE_EXPARATION_TIME)
		));
	}
}