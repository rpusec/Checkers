<?php

require_once('BaseController.class.php');

class ChatController extends BaseController
{
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

	public static function getMessages(){
		if(!parent::isUserLogged())
			return array('success' => false, 'error' => CANNOT_RETRIEVE_MESSAGES);

		parent::startConnection();
		self::deleteOldMessages();
		$results = DB::query('SELECT messageID, user.FName as firstName, user.LName as lastName, message, exparation FROM message JOIN user ON (user.userID = message.USER_UserID)');
		return array(
			'success' => true, 
			'messages' => $results
		);
	}

	private static function deleteOldMessages(){
		DB::delete('message', 'exparation<%i', parent::getTimeInSec());
	}
}