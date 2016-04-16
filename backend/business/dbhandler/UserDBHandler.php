<?php

require_once('../libs/meekrodb.2.3.class.php');

class UserDBHandler
{
	const SEARCH_BY_ID = 1;
	const SEARCH_BY_USERNAME = 2;
	
	public static function getUserIDsFromRoom($roomID){
		return DB::query("SELECT userID FROM room JOIN user ON(room.roomID = user.ROOM_roomID) WHERE roomID=%i", $roomID);
	}

	public static function insertUser($firstname, $lastname, $username, $password){
		DB::insert('user', array(
			'fname' => $firstname,
			'lname' => $lastname,
			'username' => $username,
			'password' => $password
		));
	}

	public static function updateUser($arrUpdate, $userID){
		DB::update('user', $arrUpdate, "userID=%i", $userID);
	}

	public static function updateUserColors($red, $green, $blue, $userID, $updateConnection = TRUE){
		$updateArr = array(
			'chatColorR' => $red,
			'chatColorG' => $green,
			'chatColorB' => $blue
		);

		if($updateConnection === TRUE)
			$updateArr['connected'] = 1;

		DB::update('user', $updateArr, 'userID=%i', $userID);
	}

	public static function getAllConnectedUsers(){
		return DB::query(
			'SELECT userID, ' . 
			'fname as firstname, ' .
			'lname as lastname, ' .
			'username, ' .
			'chatColorR, ' .
			'chatColorG, ' .
			'chatColorB, ' .
			'won, ' . 
			'lost ' . 
			'FROM user WHERE connected = 1');
	}

	public static function updateUserAsNotInARoom($userID){
		DB::update('user', array('ROOM_roomID' => 0), 'userID=%i', $userID));
	}

	public static function updateUserAsDisconnected($userID){
		DB::update('user', array(
			'connected' => 0,
			'ROOM_roomID' => 0
		), 'userID=%i', $userID);
	}

	public static function updateConnectionTime($timeInSeconds, $userID){
		DB::update('user', array(
			'connexparation' => $timeInSeconds + CONN_EXPARATION_TIME
		), 'userID=%i', $userID;
	}

	public static function markAppropriateUsersAsDisconnected($credential = null, $searchBy = self::SEARCH_BY_ID){
		DB::update('user', array('connected' => 0, 'ROOM_roomID' => 0), 'connexparation<%i' . ($credential !== null ? ' AND ' . ($searchBy === self::SEARCH_BY_ID ? 'userID=%i' : 'username=%s') : ''), parent::getTimeInSec(), $credential);
	}
}