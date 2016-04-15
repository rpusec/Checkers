<?php

require_once('../config/constants.php');
require_once('dbhandler/RoomDBHandler.php');

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
			RoomDBHandler::updateRoom($users[$randUserInt]['userID'], self::constructStringifiedBoard(), null, null, $roomID);
		}
	}
}