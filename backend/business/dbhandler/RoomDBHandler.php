<?php

require_once('../libs/meekrodb.2.3.class.php');

class RoomDBHandler
{
	public static function getAllRooms(){
		return DB::query('SELECT roomID FROM room');
	}

	public static function countUsersFromRoom($roomID){
		DB::query('SELECT roomID FROM room JOIN user ON (room.roomID = user.ROOM_roomID) WHERE room.roomID=%i', $roomID);
		return DB::count();
	}

	public static function updateRoom($whoseTurn, $stringifiedBoard, $lastMove, $removedPawns, $roomID){
		DB::update('room', array(
			'whoseTurn' => $whoseTurn,
			'stringifiedBoard' => $stringifiedBoard,
			'lastMove' => $lastMove,
			'removedPawns' => $removedPawns,
		), 'roomID=%i', $roomID);
	}

	public static function checkForOpponent($userID){
		return DB::queryFirstRow('SELECT ROOM_roomID as roomID, userID, fname as firstname, lname as lastname, username '
			.'FROM user JOIN room ON (user.ROOM_roomID = room.roomID) '
			.'WHERE userID <> %i', $userID);
	}

	public static function getRoomsWithUserCount($roomID = null){
		$rooms = DB::query(
			"SELECT room.roomID as targetRoomID, " . 
			"(SELECT count(*) FROM room JOIN user ON (room.roomID = user.ROOM_roomID) WHERE room.roomID = targetRoomID) as userCount " . 
			"FROM room" . ($roomID !== null ? " WHERE roomID=%i" : ""), $roomID);

		if($roomID !== null && !empty($rooms))
			return $rooms[0];
		return $rooms;
	}

	public static function getAllUsersFromRoom($roomID){
		return DB::query('SELECT userID, fname as firstname, lname as lastname, username FROM user JOIN room ON (user.ROOM_roomID = room.roomID) WHERE roomID=%i', $roomID);
	}

	public static function getWhoseTurnFromRoom($roomID){
		return DB::query('SELECT whoseTurn FROM room WHERE roomID=%i', $roomID);
	}

	public static function setupStringifiedBoard($stringifiedBoard, $roomID){
		DB::update('room', array(
			'stringifiedBoard' => $stringifiedBoard
		), 'roomID=%i', $roomID);
	}

	public static function addUpPlayerWon($userID, $roomID){
		DB::query('UPDATE user SET won = won + 1 WHERE userID=%i AND ROOM_roomID=%i', $userID, $roomID);
	}

	public static function addUpPlayerLose($userID, $roomID){
		DB::query('UPDATE user SET lost = lost + 1 WHERE userID=%i AND ROOM_roomID=%i', $userID, $roomID);
	}

	public static function addUpOpponentWon($userID, $roomID){
		DB::query('UPDATE user SET won = won + 1 WHERE userID<>%i AND ROOM_roomID=%i', $userID, $roomID);
	}

	public static function addUpOpponentLose($userID, $roomID){
		DB::query('UPDATE user SET lost = lost + 1 WHERE userID<>%i AND ROOM_roomID=%i', $userID, $roomID);
	}

	public static function getStringBoard($roomID){
		return DB::queryFirstRow("SELECT stringifiedBoard FROM room WHERE roomID=%i", $roomID);
	}

	public static function getRoomIDsFromUser($userID){
		return DB::queryFirstRow('SELECT roomID FROM room JOIN user ON (room.roomID = user.ROOM_roomID) WHERE userID=%i', $userID);
	}

	public static function getRoomByIDAndWhoseTurn($userID){
		return DB::query("SELECT roomID, whoseTurn FROM room JOIN user ON(user.ROOM_roomID = room.roomID) WHERE userID=%i", $userID);
	}

	public static function getAllRoomInfoByUserID($userID){
		DB::queryFirstRow("SELECT roomID, whoseTurn, lastMove, removedPawns FROM user JOIN room ON(room.roomID = user.ROOM_roomID) WHERE userID=%i", $userID);
	}
}