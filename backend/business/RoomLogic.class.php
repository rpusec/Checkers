<?php

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

	public static function setUserAsFirstOrSecond(){
		//fetching all of the users from the game room 
		DB::query('SELECT roomID FROM room JOIN user ON (room.roomID = user.ROOM_roomID) WHERE room.roomID=%i', $roomID);
		$userCount = DB::count();

		//marking the user as either the first or the second player
		return $userCount == 1 ? FIRST_PLAYER : SECOND_PLAYER;
	}

	/**
	 * Randomly setting who's turn it is in the database 
	 * when the second player joins the game. 
	 */
	public static function setupInitialPlayerTurn($playerTurn, $roomID){
		$users = DB::query('SELECT userID, fname as firstname, lname as lastname, username FROM user JOIN room ON (user.ROOM_roomID = room.roomID)');

		//randomly setting who's turn it is in the database when the second player joins the game 
		if($playerTurn === SECOND_PLAYER)
		{
			$randUserInt = mt_rand(0,1);
			DB::update('room', array(
				'whose_turn' => $users[$randUserInt]['userID'],
				'stringifiedBoard' => self::constructStringifiedBoard(),
				'lastMove' => null,
				'removedPawns' => null,
			), 'roomID=%i', $roomID);
		}
	}
}