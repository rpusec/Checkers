<?php

require_once('../libs/meekrodb.2.3.class.php');

/**
 * Handles all of the database related operations for users. 
 * @see [http://meekro.com/] Documentation on meekrodb library. 
 * @author Roman Pusec
 */
class UserDBHandler
{
	const SEARCH_BY_ID = 1;
	const SEARCH_BY_USERNAME = 2;
	
	/**
	 * Returns all of the userIDs from a particular room. 
	 * @param  [Integer] $roomID The ID of the room. 
	 * @return [Array]         The array of userIDs. 
	 */
	public static function getUserIDsFromRoom($roomID){
		return DB::query("SELECT userID FROM room JOIN user ON(room.roomID = user.ROOM_roomID) WHERE roomID=%i", $roomID);
	}

	/**
	 * Inserts a new user to the database. 
	 * @param  [String] $firstname The first name. 
	 * @param  [String] $lastname  The last name. 
	 * @param  [String] $username  The username. 
	 * @param  [String] $password  The password. 
	 */
	public static function insertUser($firstname, $lastname, $username, $password){
		DB::insert('user', array(
			'fname' => $firstname,
			'lname' => $lastname,
			'username' => $username,
			'password' => $password
		));
	}

	/**
	 * Updates certain information of a user. 
	 * @param  [Array]   $arrUpdate The update array. Contains all of the new values. 
	 * @param  [Integer] $userID    The ID of the target user. 
	 */
	public static function updateUser($arrUpdate, $userID){
		DB::update('user', $arrUpdate, "userID=%i", $userID);
	}

	/**
	 * Sets the RGB values for a user in the database. Also updates the user's connection status, if specified. 
	 * @param  [Integer]  $red              The RED color. 
	 * @param  [Integer]  $green            The GREEN color. 
	 * @param  [Integer]  $blue             The BLUE color. 
	 * @param  [Integer]  $userID           The target ID of the user. 
	 * @param  boolean  $updateConnection   True if the user should be marked as connected, false otherwise. 
	 */
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

	/**
	 * Returns all connected users. 
	 * @return [Array] Array of connected users. 
	 */
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

	/**
	 * Marks the user as not in a present room. 
	 * @param  [Integer] $userID The target user ID. 
	 */
	public static function updateUserAsNotInARoom($userID){
		DB::update('user', array('ROOM_roomID' => 0), 'userID=%i', $userID);
	}

	/**
	 * Marks the user as disconnected in the database. 
	 * @param  [Integer] $userID The target user ID. 
	 */
	public static function updateUserAsDisconnected($userID){
		DB::update('user', array(
			'connected' => 0,
			'ROOM_roomID' => 0
		), 'userID=%i', $userID);
	}

	/**
	 * Updates the connection time of a particular user. 
	 * @param  [Number] $timeInSeconds The current time in seconds. 
	 * @param  [Integer] $userID       The target user ID. 
	 */
	public static function updateConnectionTime($timeInSeconds, $userID){
		DB::update('user', array(
			'connexparation' => $timeInSeconds + CONN_EXPARATION_TIME
		), 'userID=%i', $userID);
	}

	/**
	 * Marks appropiate users as disconnected based on their connection exparation date. 
	 * @param  [type] $timeInSeconds Current time in seconds. 
	 * @param  [type] $credential    The name of the credential to search by. 
	 * @param  [type] $searchBy      The credential to search by. If value not specified, it won't search by any credential.
	 */
	public static function markAppropriateUsersAsDisconnected($timeInSeconds, $credential = null, $searchBy = self::SEARCH_BY_ID){
		DB::update('user', array('connected' => 0, 'ROOM_roomID' => 0), 'connexparation<%i' . ($credential !== null ? ' AND ' . ($searchBy === self::SEARCH_BY_ID ? 'userID=%i' : 'username=%s') : ''), $timeInSeconds, $credential);
	}

	/**
	 * Fetches a user by their username and password. 
	 * @param  [String] $username Username value. 
	 * @param  [String] $password Password value. 
	 * @return [Array]            The user, directly fetched from the database. 
	 */
	public static function getUserByUsernameAndPassword($username, $password){
		return DB::queryFirstRow("SELECT userID, username, password, connected FROM user WHERE username = %s AND password = %s", $username, $password);
	}

	public static function getUserByID($userID){
		return DB::queryFirstRow('SELECT fname as firstname, lname as lastname, username FROM user WHERE userID = %i', $userID);
	}

	/**
	 * Returns the connection state and the RGB colors of a particular user. 
	 * @param  [Integer] $userID The ID of the user. 
	 * @return [Array] The user's said information. 
	 */
	public static function getConnStatAndColorsFromUser($userID){
		return DB::queryFirstRow('SELECT connected, chatColorR, chatColorG, chatColorB FROM user WHERE userID = %i', $userID);
	}
}