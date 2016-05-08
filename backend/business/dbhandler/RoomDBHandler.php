<?php

require_once('../libs/meekrodb.2.3.class.php');

/**
 * Handles all database operations regarding rooms. 
 * @see [http://meekro.com/] Documentation on meekrodb library. 
 * @author Roman Pusec
 */
class RoomDBHandler
{
	/**
	 * Returns all rooms from the database. 
	 * @return [Array] All rooms. 
	 */
	public static function getAllRooms(){
		return DB::query('SELECT roomID FROM room');
	}

	/**
	 * Counts how many users there are in a room. 
	 * @param  [Integer] $roomID The ID of the room. 
	 * @return [Integer]         The count of users from the specified room. 
	 */
	public static function countUsersFromRoom($roomID){
		DB::query('SELECT roomID FROM room JOIN user ON (room.roomID = user.ROOM_roomID) WHERE room.roomID=%i', $roomID);
		return DB::count();
	}

	/**
	 * Updates a room. 
	 * @param  [Array] $updateArr   The update array, contains all of the records to update. 
	 * @param  [Integer] $roomID    The ID of the room. 
	 */
	public static function updateRoom($updateArr, $roomID){
		DB::update('room', $updateArr, 'roomID=%i', $roomID);
	}

	/**
	 * Checks for the player's opponent. 
	 * @param  [Integer] $userID The ID of the player, NOT the opponent. 
	 * @return [Array]           The opponent. 
	 */
	public static function checkForOpponent($userID, $roomID){
		return DB::queryFirstRow('SELECT ROOM_roomID as roomID, userID, fname as firstname, lname as lastname, username '
			.'FROM user JOIN room ON (user.ROOM_roomID = room.roomID) '
			.'WHERE userID <> %i AND roomID=%i', $userID, $roomID);
	}

	/**
	 * Returns a list of rooms with their user counts. If ID of the room is specified, then it would return only one single room. 
	 * @param  [Integer] $roomID The ID of the specified room. Default is null. 
	 * @return [Array]           The list of rooms, or a single room if the ID is specified. 
	 */
	public static function getRoomsWithUserCount($roomID = null){
		$userCountQuery = "(SELECT count(*) FROM room JOIN user ON (room.roomID = user.ROOM_roomID) WHERE room.roomID = targetRoomID)";
		
		$query = "SELECT user.username as username, room.roomID as targetRoomID, $userCountQuery as userCount " . 
			"FROM room LEFT JOIN user ON(room.roomID = user.ROOM_roomID) " . ($roomID !== null ? " WHERE roomID=%i" : "");

		if($roomID === null)
			return DB::query($query);
		else
			return DB::queryFirstRow($query, $roomID);
	}

	/**
	 * Returns all users from one specific room. 
	 * @param  [Integer] $roomID The ID of the room. 
	 * @return [Array]           The list of users from a room. 
	 */
	public static function getAllUsersFromRoom($roomID){
		return DB::query('SELECT userID, fname as firstname, lname as lastname, username FROM user JOIN room ON (user.ROOM_roomID = room.roomID) WHERE roomID=%i', $roomID);
	}

	/**
	 * Returns the 'whoseTurn' value from a room. 
	 * @param  [Integer] $roomID The ID of the room. 
	 * @return [Array]           List of rooms. 
	 */
	public static function getWhoseTurnFromRoom($roomID){
		return DB::queryFirstRow('SELECT whoseTurn FROM room WHERE roomID=%i', $roomID);
	}

	/**
	 * Sets up a new value for the stringified board of a room. 
	 * @param  [String] $stringifiedBoard The stringified board. 
	 * @param  [Integer] $roomID          The ID of the room. 
	 */
	public static function setupStringifiedBoard($stringifiedBoard, $roomID){
		DB::update('room', array(
			'stringifiedBoard' => $stringifiedBoard
		), 'roomID=%i', $roomID);
	}

	/**
	 * Updates the won state in the database of the player. 
	 * @param [Integer] $userID The player ID. 
	 * @param [Integer] $roomID The room ID. 
	 */
	public static function addUpPlayerWon($userID, $roomID){
		DB::query('UPDATE user SET won = won + 1 WHERE userID=%i AND ROOM_roomID=%i', $userID, $roomID);
	}

	/**
	 * Updates the lost state in the database of the player. 
	 * @param [Integer] $userID The player ID. 
	 * @param [Integer] $roomID The room ID. 
	 */
	public static function addUpPlayerLose($userID, $roomID){
		DB::query('UPDATE user SET lost = lost + 1 WHERE userID=%i AND ROOM_roomID=%i', $userID, $roomID);
	}

	/**
	 * Updates the won state in the database of the opponent. 
	 * @param [Integer] $userID The player ID, NOT of the opponent. 
	 * @param [Integer] $roomID The room ID. 
	 */
	public static function addUpOpponentWon($userID, $roomID){
		DB::query('UPDATE user SET won = won + 1 WHERE userID<>%i AND ROOM_roomID=%i', $userID, $roomID);
	}

	/**
	 * Updates the lost state in the database of the opponent. 
	 * @param [Integer] $userID The player ID, NOT of the opponent. 
	 * @param [Integer] $roomID The room ID. 
	 */
	public static function addUpOpponentLose($userID, $roomID){
		DB::query('UPDATE user SET lost = lost + 1 WHERE userID<>%i AND ROOM_roomID=%i', $userID, $roomID);
	}

	/**
	 * Returns the stringified board from a room. 
	 * @param  [Integer] $roomID The ID of the room. 
	 * @return [Array]         The room with the stringified board. 
	 */
	public static function getStringBoard($roomID){
		return DB::queryFirstRow("SELECT stringifiedBoard FROM room WHERE roomID=%i", $roomID);
	}

	/**
	 * Returns the ID of a room based on the user ID. 
	 * @param  [Integer] $userID The ID of the user. 
	 * @return [Array]         The roomID. 
	 */
	public static function getRoomIDFromUser($userID){
		return DB::queryFirstRow('SELECT roomID FROM room JOIN user ON (room.roomID = user.ROOM_roomID) WHERE userID=%i', $userID);
	}

	/**
	 * Returns the room ID and whoseTurn variable by the user ID. 
	 * @param  [Integer] $userID The user ID. 
	 * @return [Array]           A room. 
	 */
	public static function getRoomIDAndWhoseTurnByUser($userID){ 
		return DB::queryFirstRow("SELECT roomID, whoseTurn FROM room JOIN user ON(user.ROOM_roomID = room.roomID) WHERE userID=%i", $userID);
	}

	/**
	 * Returns all room information by user ID. 
	 * @param  [Integer] $userID User ID. 
	 * @return [Array]           All room information. 
	 */
	public static function getAllRoomInfoByUserID($userID){
		return DB::queryFirstRow("SELECT roomID, stringifiedBoard, whoseTurn, lastMove, removedPawns FROM user JOIN room ON(room.roomID = user.ROOM_roomID) WHERE userID=%i", $userID);
	}

	/**
	 * Returns the last move from a room. 
	 * @param  [Integer] $roomID The target room. 
	 * @return [String]          Last move. 
	 */
	public static function getLastMove($roomID){
		$room = DB::queryFirstRow("SELECT lastMove FROM room WHERE roomID=%i", $roomID);
		return $room['lastMove'];
	}
}