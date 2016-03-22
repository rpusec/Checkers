<?php

require_once('BaseController.class.php');
require_once('../helper/ValidationHelper.class.php');

/**
 * Controller class which handles all of the 
 * business operations aimed at GameRooms. 
 * @author Roman Pusec
 */
class RoomController extends BaseController
{
	/**
	 * Fetches all of the rooms from the database. 
	 * @return Array Success flag, and the list of rooms. 
	 */
	public static function getAllRooms()
	{
		if(!parent::isUserLogged())
			return array('success' => false);

		parent::startConnection();
		$rooms = DB::query('SELECT roomID FROM room');

		return array('success' => true, 'rooms' => $rooms);
	}

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

	public static function removeFromGameRoom()
	{
		if(!parent::isUserLogged())
			return array('success' => false, 'errors' => array(USER_NOT_LOGGED_MSG));

		parent::startConnection();

		DB::update('user', array(
			'ROOM_roomID' => 0
		), 'userID=%i', parent::getLoggedUserID());

		return array('success' => true);
	}
}