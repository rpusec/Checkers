<?php

require_once('../config/constants.php');
require_once('dbhandler/RoomDBHandler.php');
require_once('dbhandler/UserDBHandler.php');

/**
 * Offers all of the business processes for the game rooms. 
 * @author Roman Pusec
 */
class RoomLogic
{
    /**
	 * Constructs an initial 'stringified' board, with all pawns (denoted with integers 
	 * from 1 to 24) all in place the way they are at the start of a game of checkers. 
	 * @return String Stringified board. 
	 */
	public static function constructStringifiedBoard(){
		$resultStr = "";
		$pawnCurrId = 1;

		for($row = 1; $row <= BOARD_MAX_ROW_AMOUNT; $row++)
		{
			for($col = 1; $col <= BOARD_MAX_COL_AMOUNT; $col++)
			{
				$colModByTwo = $col % 2;
				if(($row % 2) !== 0 ? $colModByTwo === 0 : $colModByTwo !== 0)
				{
					$resultStr .= BOARD_BG;
				}
				else
				{
					if($pawnCurrId <= PLAYER_PAWNS_AMOUNT)
					{
						$resultStr .= $pawnCurrId;
						$pawnCurrId++;
					}
					else if($row >= PLAYER_TWO_ROW_POSITION)
					{
						if($pawnCurrId <= PLAYER_PAWNS_AMOUNT*2)
						{
							$resultStr .= $pawnCurrId;
							$pawnCurrId++;
						}
						else
							$resultStr .= BOARD_BG;
					}
					else
						$resultStr .= BOARD_BG;
				}

				if($col !== BOARD_MAX_COL_AMOUNT)
					$resultStr .= BOARD_COL_SEPARATOR;
			}

			if($row !== BOARD_MAX_ROW_AMOUNT)
				$resultStr .= BOARD_ROW_SEPARATOR;
		}

		return $resultStr;
	}

	/**
	 * Determines whether the user should be marked as 
	 * the first or the second player in the game. 
	 * @param [Integer] $roomID The ID of the target room. 
	 * @return [Integer] Either the first or the second player id, depending on the user count. 
	 */
	public static function setUserAsFirstOrSecond($roomID){
		//fetching all of the users from the game room 
		$userCount = RoomDBHandler::countUsersFromRoom($roomID);

		//marking the user as either the first or the second player
		return $userCount == 1 ? FIRST_PLAYER : SECOND_PLAYER;
	}

	/**
	 * Randomly setting who's turn it is in the database 
	 * when the second player joins the game. 
	 */
	public static function setupInitialPlayerTurn($playerTurn, $roomID, $users){
		if($playerTurn === SECOND_PLAYER)
		{
			$randUserInt = mt_rand(0,1);
			RoomDBHandler::updateRoom(array(
				'whoseTurn' => $users[$randUserInt]['userID'], 
				'stringifiedBoard' => self::constructStringifiedBoard(), 
				'lastMove' => null, 
				'removedPawns' => null
			), $roomID);
		}
	}

	/**
	 * Returns a list of rooms with their user counts. If ID of the room is specified, then it would return only one single room. 
	 * @param  [Integer] $roomID The ID of the specified room. Default is null. 
	 * @return [Array]           The list of rooms, or a single room if the ID is specified. 
	 */
	public static function getRoomsWithUserCount($roomID = null){
		return RoomDBHandler::getRoomsWithUserCount($roomID);
	}

	/**
	 * Checks for the player's opponent. 
	 * @param  [Integer] $userID The ID of the player, NOT the opponent. 
	 * @return [Array]           The opponent. 
	 */
	public static function checkForOpponent($userID){
		return RoomDBHandler::checkForOpponent($userID);
	}

	/**
	 * Returns all users from one specific room. 
	 * @param  [Integer] $roomID The ID of the room. 
	 * @return [Array]           The list of users from a room. 
	 */
	public static function getAllUsersFromRoom($roomID){
		return RoomDBHandler::getAllUsersFromRoom($roomID);
	}

	/**
	 * Returns all rooms from the database. 
	 * @return [Array] All rooms. 
	 */
	public static function getAllRooms(){
		return RoomDBHandler::getAllRooms();
	}

	/**
	 * References a room ID to a user. 
	 * @param  [Integer] $roomID The ID of the room. 
	 * @param  [Integer] $userID The ID of the user. 
	 */
	public static function setupRoomIDForUser($roomID, $userID){
		UserDBHandler::updateUser(array('ROOM_roomID' => $roomID), $userID);
	}
}