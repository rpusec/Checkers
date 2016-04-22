<?php

require_once('../config/constants.php');
require_once('../controller/UsersController.class.php');
require_once('../business/RoomLogic.class.php');
require_once('dbhandler/RoomDBHandler.php');

/**
 * Offers all sorts of business rules relating to the game logic. 
 * @author Roman Pusec
 */
class GameLogic
{
	const DIAGONALLY_DISMISS_OPPONENTS_LEFT_UP_DIR = 0;
	const DIAGONALLY_DISMISS_OPPONENTS_RIGHT_UP_DIR = 1;
	const DIAGONALLY_DISMISS_OPPONENTS_LEFT_DOWN_DIR = 2;
	const DIAGONALLY_DISMISS_OPPONENTS_RIGHT_DOWN_DIR = 3;

	const MIN_POSITION = 2;
	const MAX_POSITION = 8;
	const ILLEGAL_POS_TEXT = 'Illegal position: ';

	/**
	 * Sets the beginning turn time. This value will help evaluate whether 
	 * the time it took for player to finish their move was legal. The value
	 * that's set is the current time in seconds. 
	 */
	public static function setBeginningTurnTime($beginningTurnTime){
		$_SESSION['beginningTurnTime'] = $beginningTurnTime;
	}

	/**
	 * Returns the beginning turn time. 
	 * @return Number The beginning turn time. 
	 */
	public static function getBeginningTurnTime(){
		return $_SESSION['beginningTurnTime'];
	}

    /**
     * Checks which player's turn it is. 
     * @param  [Integer] $roomID The room ID. 
     * @return [Integer]         The database ID of the player. 
     */
    public static function getPlayerTurn($roomID){
    	$turn = RoomDBHandler::getWhoseTurnFromRoom($roomID);

		if($turn !== null)
			$turn = intval($turn['whoseTurn']);

		return $turn;
    }

    /**
     * Checks whether the pawn the user wants to move is their actual pawn. 
     * @param  [Integer] $prevPosition Player's previous position. 
     * @param  [Integer] $playerNumber The player number. 
     * @return [Array]                 Array with success flag and error message if it's a legitimate player pawn, false otherwise. 
     */
    public static function checkIfActualUserPawn($prevPosition, $playerNumber){
    	if($playerNumber === FIRST_PLAYER)
		{
			if($prevPosition > PLAYER_PAWNS_AMOUNT)
				return array('success' => false, 'error' => 'The pawn is not yours. ');
		}
		else if($playerNumber === SECOND_PLAYER)
		{
			if($prevPosition <= PLAYER_PAWNS_AMOUNT)
				return array('success' => false, 'error' => 'The pawn is not yours. ');
		}
    }

    /**
     * Checking if the new position is equivalend to the old one, which should not happen. 
     * @return [Array] Array with success flag and error message if it's a legitimate player pawn, false otherwise. 
     */
    public static function checkIfPrevPosEqualToNewOne($newPosition, $prevPosition){
    	if($newPosition === $prevPosition)
			return array('success' => false, 'error' => 'Previous position should not be equivalent to the new position. ');
		return null;
    }

    /**
     * Checks whether the new position represents an actual pawn (if the value
     * from the stringified board is greater than 0). 
     * @param  [Integer] $newPosition The new position. 
     * @return [Array] Array with success flag and error message if it's a legitimate player pawn, false otherwise. 
     */
    public static function checkIfNewPosRepresentsAPawn($newPosition){
    	if($newPosition > 0)
			return array('success' => false, 'error' => 'New position should not be a pawn, but an empty field. ');
		return null;
    }

    /**
     * Checks whether a pawn is not located at the specified previous position (if its value 
     * from the stringified board is equivalent to zero). 
     * @param  [Integer] $prevPosition The previous position from the stringified board. 
     * @return [Array] Array with success flag and error message if it's a legitimate player pawn, false otherwise. 
     */
    public static function checkIfPrevPosIsNotAPawn($prevPosition){
    	if($prevPosition === 0)
			return array('success' => false, 'error' => 'Illegally supplied previous position. ');
		return null;
    }

    public static function checkIfPlayerTurn($targetRoom, $loggedUserID){
    	$whoseTurn = $targetRoom['whoseTurn'];
		if($whoseTurn !== $loggedUserID)
			return array('success' => false, 'error' => 'It\'s not your turn. ');
		return null;
    }

    /**
     * Creates a new stringified board based on the specified array of board block rows. 
     * It also counts how many player one and two pawns there are. 
     * @param  [Array] $boardRows Array of board block rows. 
     * @param  [Integer] $playerOnePawns The variable that will hold the amount player one of pawns. 
     * @param  [Integer] $playerTwoPawns The variable that will hold the amount player two of pawns. 
     */
    public static function createModifiedStringifiedBoard($boardRows, &$playerOnePawns, &$playerTwoPawns){
    	$newStringifiedBoard = "";
		foreach($boardRows as $boardRowKey => $boardRowVal)
		{
			$newStringifiedBoard .= implode(BOARD_COL_SEPARATOR, $boardRowVal);
						
			foreach($boardRowVal as $boardCol)
			{
				if($boardCol > PLAYER_PAWNS_AMOUNT)
					$playerTwoPawns++;
				else if($boardCol <= PLAYER_PAWNS_AMOUNT && $boardCol > 0)
					$playerOnePawns++;
			}
						
			if($boardRowKey !== count($boardRows)-1)
				$newStringifiedBoard .= BOARD_ROW_SEPARATOR;
		}
		return $newStringifiedBoard;
    }

    /**
     * Switches the turn to the opponent. 
     * @param [Array] $targetRoom     The target room directly fetched from the database. 
     * @param [Integer] $loggedUserID The ID of the authenticated user. 
     */
    public static function setOpponentTurn($targetRoom, $loggedUserID){
    	$users = RoomDBHandler::getAllUsersFromRoom($targetRoom['roomID']);
    	if(!empty($users) && count($users) === ROOM_MAX_AMOUNT_OF_USERS)
			if($targetRoom['whoseTurn'] == $loggedUserID)
				return GameLogic::switchUserTurn($users[0], $users[1], $loggedUserID);
		else
			return array('success' => false);
    }

    /**
     * Counts the player one and two pawns. 
     * @param  [Array] $boardRowStrArr  The array of all board rows from the stringified board. 
     * @param  [Integer] &$playerOnePawns  The amount of player one pawns. 
     * @param  [Integer] &$playerTwoPawns  The amount of player two pawns. 
     */
    public static function countPlayerOneTwoPawns($boardRowStrArr, &$playerOnePawns, &$playerTwoPawns){
    	foreach($boardRowStrArr as $boardRowStr)
		{
			$boardColArr = explode(BOARD_COL_SEPARATOR, $boardRowStr);

			foreach($boardColArr as $boardCol)
			{
				if($boardCol > PLAYER_PAWNS_AMOUNT)
					$playerTwoPawns++;
				else if($boardCol <= PLAYER_PAWNS_AMOUNT && $boardCol > 0)
					$playerOnePawns++;
			}
		}
    }

    /**
     * Updates the player's and opponent's current won and lost state in the database 
     * (how much rounds they have lost and won). When executed, it increases the player's and
     * the oppoenent's won and lose variables for one, depending who's the winner. 
     * @param  [Array] $targetUser     The user directly fetched from the database. 
     * @param  [Integer] $loggedUserID The ID of the authenticated user. 
     * @param  [Integer] $playerNumber The player number. 
     * @param  [type] $winner          The player number of the winner. 
     */
    public static function updateWonLoseState($targetUser, $loggedUserID, $playerNumber, $winner){
		RoomDBHandler::setupStringifiedBoard(RoomLogic::constructStringifiedBoard(), $targetUser['roomID']);

		if($winner === $playerNumber)
		{
			RoomDBHandler::addUpPlayerWon($loggedUserID, $targetUser['roomID']);
			RoomDBHandler::addUpOpponentLose($loggedUserID, $targetUser['roomID']);
		}
		else
		{
			RoomDBHandler::addUpPlayerLose($loggedUserID, $targetUser['roomID']);
			RoomDBHandler::addUpOpponentWon($loggedUserID, $targetUser['roomID']);
		}
    }

    /**
     * checks if the turn duration is legal, that is, if it's not less than the configured value. 
     * @param  [type] $timeInSeconds The current time in seconds. 
     * @return [Array] Array with success flag and error message if it's a legitimate player pawn, false otherwise. 
     */
    public static function checkTurnDuration($timeInSeconds){
    	if(($timeInSeconds - GameLogic::getBeginningTurnTime()) > TURN_DURATION)
		{
			UsersController::logoutUser(false);
			return array('success' => false, 'error' => 'Your turn time is longer than ' . TURN_DURATION . ' seconds. It was: ' . ($timeInSeconds - GameLogic::getBeginningTurnTime()));
		}

		return null;
    }

    /**
     * Checks if the room is not full. 
     * @see [config/constants.php] For ROOM_MAX_AMOUNT_OF_USERS constant. 
     * @param  [Array] $users The gathered array of users. 
     * @return [Boolean]      True if the room is not full, false otherwise. 
     */
    public static function checkIfTheRoomIsNotFull($users){
    	if(count($users) < ROOM_MAX_AMOUNT_OF_USERS)
    		return true;
    	return false; 
    }

    /**
     * Calls the self::diagonallyDismissOpponents on all sides. 
     * @see Documentation for self::diagonallyDismissOpponents for method parameter explanation.  
     */
    public static function diagonallyDismissOpponentsAllSides($prevX, $prevY, $newX, $newY, $playerNumber, &$boardRows, &$removedPawnIds, &$errorMsg)
    {
    	GameLogic::diagonallyDismissOpponents($prevX, $prevY, $newX, $newY, $playerNumber, $boardRows, self::DIAGONALLY_DISMISS_OPPONENTS_LEFT_UP_DIR, $removedPawnIds, $errorMsg);
		
		if(empty($removedPawnIds))
			GameLogic::diagonallyDismissOpponents($prevX, $prevY, $newX, $newY, $playerNumber, $boardRows, self::DIAGONALLY_DISMISS_OPPONENTS_RIGHT_UP_DIR, $removedPawnIds, $errorMsg);
		
		if(empty($removedPawnIds))
			GameLogic::diagonallyDismissOpponents($prevX, $prevY, $newX, $newY, $playerNumber, $boardRows, self::DIAGONALLY_DISMISS_OPPONENTS_LEFT_DOWN_DIR, $removedPawnIds, $errorMsg);
		
		if(empty($removedPawnIds))
			GameLogic::diagonallyDismissOpponents($prevX, $prevY, $newX, $newY, $playerNumber, $boardRows, self::DIAGONALLY_DISMISS_OPPONENTS_RIGHT_DOWN_DIR, $removedPawnIds, $errorMsg);
    }

    /**
	 * Checks whether, based on the player's move, there are any opponent's pawns that can be killed off. 
	 * This function also evaluates if the player chose a legal move in the process. 
	 * @param  [Integer] $prevX                  The initial position on the X-axis of the target pawn. 
	 * @param  [Integer] $prevY                  The initial position on the Y-axis of the target pawn. 
	 * @param  [Integer] $newX                   The new position on the X-axis of the target pawn. 
	 * @param  [Integer] $newY                   The new position on the Y-axis of the target pawn. 
	 * @param  [Array<Integer>] &$boardRows      The reference of the boardRows array (parsed from the stringified board). 
	 * @param  [Integer] $direction              Which diagonal direction should the search follow. See appropriate constants (DIAGONALLY_DISMISS_OPPONENTS_[direction]_DIR). 
	 * @param  [Array<Integer>] &$removedPawnIds An array which will save and forward all of the ids of the pawns that had been killed off.  
	 * @param  [String] &$errorMsg               The error message that will be forwarded later outside of the class. 
	 */
	public static function diagonallyDismissOpponents($prevX, $prevY, $newX, $newY, $playerNumber, &$boardRows, $direction, &$removedPawnIds, &$errorMsg)
	{
		switch($direction)
		{
			case self::DIAGONALLY_DISMISS_OPPONENTS_LEFT_UP_DIR : 
				$diffX = -1;
				$diffY = -1;
				break;
			case self::DIAGONALLY_DISMISS_OPPONENTS_RIGHT_UP_DIR : 
				$diffX = 1;
				$diffY = -1;
				break;
			case self::DIAGONALLY_DISMISS_OPPONENTS_LEFT_DOWN_DIR : 
				$diffX = -1;
				$diffY = 1;
				break;
			case self::DIAGONALLY_DISMISS_OPPONENTS_RIGHT_DOWN_DIR : 
				$diffX = 1;
				$diffY = 1;
				break;
			default:
				return null; 
		}

		for($possiblePosition = self::MIN_POSITION; $possiblePosition <= self::MAX_POSITION; $possiblePosition++)
		{
			if($prevX+($diffX*$possiblePosition) === $newX && $prevY+($diffY*$possiblePosition) === $newY)
			{
				if(($possiblePosition % 2) !== 0)
				{
					$errorMsg = self::ILLEGAL_POS_TEXT . $possiblePosition;
					return;
				}

				while(true)
				{
					if(	$prevY+$diffY < 0 || 
						$prevX+$diffX < 0 || 
						$prevY+$diffY > count($boardRows)-1 || 
						$prevX+$diffX > count($boardRows)-1)
						return;

					//it should not search further if previous and new positions are the same
					if($prevX === $newX && $prevY === $newY)
						return;

					$posEvaluation = $playerNumber === FIRST_PLAYER ? 
						($boardRows[$prevY+$diffY][$prevX+$diffX] > PLAYER_PAWNS_AMOUNT) : 
						($boardRows[$prevY+$diffY][$prevX+$diffX] > 0 && $boardRows[$prevY+$diffY][$prevX+$diffX] <= PLAYER_PAWNS_AMOUNT);

					//checking if an opponent pawn had been spotted
					if($posEvaluation)
					{
						$removedPawnIds[] = intval($boardRows[$prevY+$diffY][$prevX+$diffX]);
						$boardRows[$prevY+$diffY][$prevX+$diffX] = 0;
						$prevX+=$diffX*2;
						$prevY+=$diffY*2;
					}
					else
					{
						//if the algorithm didn't reach the end that means that the chosen position is 
						//illegal since newX and newY and the last opponent are too far apart
						if($prevX !== $newX && $prevY !== $newY)
							$errorMsg = self::ILLEGAL_POS_TEXT . $possiblePosition;
						return;
					}
				}
			}
		}
	}

    /**
	 * Checks whether the coordinate is positioned accurately. 
	 * @param  [Integer]  $xAxis         The X axis. 
	 * @param  [Integer]  $yAxis         The Y axis. 
	 * @param  [Integer]  $numToDiviseBy The number to divide by. 
	 * @return Array                  If it was an illegal move, it'll return an array with a success flag and the error message, otherwise it'll return null.  
	 */
	public static function isCoordinateInitializedAppropriately($xAxis, $yAxis, $numToDiviseBy){
		if(($yAxis % $numToDiviseBy) === 0)
		{
			if(($xAxis % $numToDiviseBy) !== 0)
				return array('success' => false, 'error' => 'The initial position [x='.$xAxis.',y='.$yAxis.'] should be divisable by ' . $numToDiviseBy . '. ');
		}
		else
		{
			if(($xAxis % $numToDiviseBy) === 0)
				return array('success' => false, 'error' => 'The initial position [x='.$xAxis.',y='.$yAxis.'] should not be divisable by ' . $numToDiviseBy . '. ');
		}

		return null;
	}

	public static function checkForWinner($playerOnePawns, $playerTwoPawns){
		if($playerOnePawns === 0 && $playerTwoPawns !== 0)
			return SECOND_PLAYER;
		else if($playerOnePawns !== 0 && $playerTwoPawns === 0)
			return FIRST_PLAYER;
		else
			return null;
	}

	/**
	 * Switches the turn from one player to another. The first two 
	 * parameters have to be the users directly fetched from the database. 
	 * @param  [Array]   $userOne       The first user. 
	 * @param  [Array]   $userTwo       The second user. 
	 * @return [Integer]                The ID of the user who's turn it is. 
	 */
	public static function switchUserTurn($userOne, $userTwo, $loggedUserID){
		if($userOne['userID'] == $loggedUserID)
			return $userTwo['userID'];
		else if($userTwo['userID'] == $loggedUserID)
			return $userOne['userID'];
	}

	/**
	 * Returns all room information by user ID. 
	 * @param  [Integer] $userID User ID. 
	 * @return [Array]           All room information. 
	 */
	public static function getAllRoomInfoByUserID($userID){
		return RoomDBHandler::getAllRoomInfoByUserID($userID);
	}

	/**
	 * Updates a room. 
	 * @param  [Array] $updateArr   The update array, contains all of the records to update. 
	 * @param  [Integer] $roomID    The ID of the room. 
	 */
	public static function updateRoom($updateArr, $roomID){
		RoomDBHandler::updateRoom($updateArr, $roomID);
	}

	/**
	 * Returns the stringified board from a room. 
	 * @param  [Integer] $roomID The ID of the room. 
	 * @return [Array]         The room with the stringified board. 
	 */
	public static function getStringBoard($roomID){
		return RoomDBHandler::getStringBoard($roomID);
	}

	/**
	 * Returns the ID of a room based on the user ID. 
	 * @param  [Integer] $userID The ID of the user. 
	 * @return [Array]         The roomID. 
	 */
	public static function getRoomIDFromUser($userID){
		return RoomDBHandler::getRoomIDFromUser($userID);
	}

	/**
	 * Returns all of the userIDs from a particular room. 
	 * @param  [Integer] $roomID The ID of the room. 
	 * @return [Array]         The array of userIDs. 
	 */
	public static function getUserIDsFromRoom($targetRoomID){
		return UserDBHandler::getUserIDsFromRoom($targetRoomID);
	}

	/**
	 * Returns the room ID and whoseTurn variable by the user ID. 
	 * @param  [Integer] $userID The user ID. 
	 * @return [Array]           A room. 
	 */
	public static function getRoomIDAndWhoseTurnByUser($userID){
		return RoomDBHandler::getRoomIDAndWhoseTurnByUser($userID);
	}
}