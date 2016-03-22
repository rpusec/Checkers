<?php

require_once('BaseController.class.php');
require_once('../helper/ValidationHelper.class.php');

class GameController extends BaseController
{
	public static function addUserToGameRoom($roomID)
	{
		if(!parent::isUserLogged())
			return array('success' => false, 'errors' => array(USER_NOT_LOGGED_MSG));

		if($roomID === null)
			return array('success' => false, 'errors' => array('RoomID was not specified. '));

		parent::startConnection();

		DB::update('user', array(
			'ROOM_roomID' => $roomID
		), 'userID=%i', parent::getLoggedUserID());

		$users = DB::query('SELECT fname as firstname, lname as lastname, username FROM user WHERE userID=%i', parent::getLoggedUserID());
		return array('success' => true, 'user' => count($users) === 1 ? $users[0] : null);
	}
}