<?php

require_once('BaseController.class.php');

class ChatController extends BaseController
{
	public static function addMessage($userID, $message)
	{
		parent::startConnection();

		DB::insert('message', array(
			'USER_userID' => 1, #$userID
			'message' => $message,
			'exparation' => "" . (parent::getTimeInSec() + EXPARATION_TIME)
		));

		return array(
			'affectedRows' => DB::affectedRows()
		);
	}

	public static function getMessages(){
		parent::startConnection();
		self::deleteOldMessages();
		$results = DB::query('SELECT messageID, user.FName as firstName, user.LName as lastName, message, exparation FROM message JOIN user ON (user.userID = message.USER_UserID)');
		return array('messages' => $results);
	}

	private static function deleteOldMessages(){
		DB::delete('message', 'exparation<%i', parent::getTimeInSec());
	}
}