<?php

require_once('../libs/meekrodb.2.3.class.php');

class RoomDBHandler
{
	public static function countUsersFromRoom($roomID){
		DB::query('SELECT roomID FROM room JOIN user ON (room.roomID = user.ROOM_roomID) WHERE room.roomID=%i', $roomID);
		return DB::count();
	}
}