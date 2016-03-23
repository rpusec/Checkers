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

	/**
	 * Adds the user (who's authenticated) to a game room specified by the first parameter. 
	 *
	 * The client side requires that the list of users from the target game room, so that they could
	 * be displayed on the screen. The following argument is the 'player number', which tells the client side
	 * that the authenticated user is either the first player or the second player who got to the game room
	 * (that way, we can differentiate the first/second player in the client side). 
	 * 
	 * @param Integer $roomID The ID value of the target game room. 
	 * @return Array Success flag indicating that the user is authenticated and that the $roomID is valid. 
	 *               It also returns a list of users from the room, the 'player number' value of the authenticated player,
	 *               and the ID of the authenticated player. 
	 */
	public static function addUserToGameRoom($roomID)
	{
		if(!parent::isUserLogged())
			return array('success' => false, 'errors' => array(USER_NOT_LOGGED_MSG));

		if($roomID === null)
			return array('success' => false, 'errors' => array('RoomID was not specified. '));

		parent::startConnection();

		//adding the authenticated user to the game room
		DB::update('user', array(
			'ROOM_roomID' => $roomID
		), 'userID=%i', parent::getLoggedUserID());

		//fetching all of the users from the game room and checking if the authenticated user was the first one to enter
		DB::query('SELECT roomID FROM room JOIN user ON (room.roomID = user.ROOM_roomID) WHERE room.roomID=%i', $roomID);
		$userCount = DB::count();

		//marking the user as either the first or the second player
		parent::setPlayerNumber($userCount == 1 ? FIRST_PLAYER : SECOND_PLAYER);

		$users = DB::query('SELECT userID, fname as firstname, lname as lastname, username FROM user JOIN room ON (user.ROOM_roomID = room.roomID)');

		if(parent::getPlayerNumber() === SECOND_PLAYER)
		{
			$randUserInt = mt_rand(0,1);
			DB::update('room', array('whose_turn' => $users[$randUserInt]['userID']), 'roomID=%i', $roomID);
		}

		return array('success' => true, 'users' => $users, 'playerNumber' => parent::getPlayerNumber(), 'loggedUserID' => parent::getLoggedUserID(), 'roomID' => $roomID);
	}

	/**
	 * Removes the user (who's authenticated) from the 
	 * game room that they're attached to. 
	 * @return Array Success flag indicating that the user is logged into the system. 
	 */
	public static function removeFromGameRoom()
	{
		if(!parent::isUserLogged())
			return array('success' => false, 'errors' => array(USER_NOT_LOGGED_MSG));

		parent::startConnection();

		DB::update('user', array(
			'ROOM_roomID' => 0
		), 'userID=%i', parent::getLoggedUserID());

		parent::removePlayerNumber();

		return array('success' => true);
	}

	/**
	 * Checks whether there's an opponent of the player. 
	 * It fetches another user who's also registered in the same room as the first user who entered the room. 
	 * Therefore, it checks for a user who's ID is not equal to that of the first user. 
	 * Value of null is returned if the opponent does not exist. 
	 * The opponent in this case would NOT be the authenticated user. 
	 * @return Array Returns a success flag indicating that a user is authenticated. It also returns the opponent fetched from the database. 
	 */
	public static function checkForOpponent()
	{
		if(!parent::isUserLogged())
			return array('success' => false, 'errors' => array(USER_NOT_LOGGED_MSG));

		parent::startConnection();

		$users = DB::query('SELECT ROOM_roomID as roomID, userID, fname as firstname, lname as lastname, username '
			.'FROM user JOIN room ON (user.ROOM_roomID = room.roomID) '
			.'WHERE userID <> %i', parent::getLoggedUserID());

		return array('success' => true, 'opponent' => (DB::count() === 1) ? $users[0] : null);
	}

	public static function checkRoomAvailability()
	{
		if(!parent::isUserLogged())
			return array('success' => false, 'errors' => array(USER_NOT_LOGGED_MSG));

		parent::startConnection();

		$countQuery = "SELECT count(*) FROM room JOIN user ON (room.roomID = user.ROOM_roomID) WHERE room.roomID = targetRoomID";
		$rooms = DB::query("SELECT room.roomID as targetRoomID, ($countQuery) as userCount FROM room");

		return array('success' => true, 'rooms' => $rooms);
	}
}