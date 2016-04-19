<?php

require_once('BaseController.class.php');
require_once('../business/RoomLogic.class.php');

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
		$rooms = RoomLogic::getAllRooms();

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
	 * @see   self::getUserCountQuery()
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

		$targetRoom = RoomLogic::getRoomsWithUserCount($roomID);
		if($targetRoom !== null && $targetRoom['userCount'] == ROOM_MAX_AMOUNT_OF_USERS)
			return array('success' => false, 'errors' => array(ROOM_MAX_NUM_OF_USERS_MSG));

		//adding the authenticated user to the game room
		RoomLogic::setupRoomIDForUser($roomID, parent::getLoggedUserID());

		//marking the user as either the first or the second player
		parent::setPlayerNumber(RoomLogic::setUserAsFirstOrSecond($roomID));
		$users = RoomLogic::getAllUsersFromRoom($roomID);
		RoomLogic::setupInitialPlayerTurn(parent::getPlayerNumber(), $roomID, $users);

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
		RoomLogic::setupRoomIDForUser(0, parent::getLoggedUserID());
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
		$opponent = RoomLogic::checkForOpponent(parent::getLoggedUserID());
		$lastMove = RoomLogic::getLastMove($opponent['roomID']);

		return array('success' => true, 'opponent' => $opponent, 'lastMove' => $lastMove, 'playerNumber' => parent::getPlayerNumber());
	}

	/**
	 * Simply returns the list of rooms and the number of users they have. 
	 * @return Array Returns a success flag, indicating that the user is logged in, and an array of rooms with the number of users they have. 
	 */
	public static function checkRoomAvailability()
	{
		if(!parent::isUserLogged())
			return array('success' => false, 'errors' => array(USER_NOT_LOGGED_MSG));

		parent::startConnection();
		$rooms = RoomLogic::getRoomsWithUserCount();

		return array('success' => true, 'rooms' => $rooms);
	}
}