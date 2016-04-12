<?php

require_once('UsersController.class.php');
require_once('RoomControllerController.class.php');

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
	public static function setBeginningTurnTime(){
		$_SESSION['beginningTurnTime'] = parent::getTimeInSec();
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
    	$turn = DB::query('SELECT whose_turn FROM room WHERE roomID=%i', $roomID);

		if(!empty($turn))
		{
			$turn = $turn[0];
			$turn = intval($turn['whose_turn']);
		}
		else
			$turn = null;

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

    public static function checkIfPlayerTurn($targetRoom){
    	$whoseTurn = $targetRoom['whose_turn'];
		if($whoseTurn !== parent::getLoggedUserID())
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

    public static function setOpponentTurn($targetRoom, $loggedUserID){
    	$users = DB::query("SELECT userID FROM user JOIN room ON(room.roomID = user.ROOM_roomID) WHERE roomID=%i", $targetRoom['roomID']);
    	if(!empty($users) && count($users) === ROOM_MAX_AMOUNT_OF_USERS)
			if($targetRoom['whose_turn'] == $loggedUserID)
				$newWhoseTurn = GameLogic::switchUserTurn($users[0], $users[1]);
		else
			return array('success' => false);
    }

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

    public static function updateWonLoseState($targetUser, $loggedUserID, $playerNumber){
    	DB::update('room', array(
			'stringifiedBoard' => RoomController::constructStringifiedBoard()
		), 'roomID=%i', $targetUser['roomID']);

		if($winner === $playerNumber)
		{
			DB::query('UPDATE user SET won = won + 1 WHERE userID=%i AND ROOM_roomID=%i', $loggedUserID, $targetUser['roomID']);
			DB::query('UPDATE user SET lost = lost + 1 WHERE userID<>%i AND ROOM_roomID=%i', $loggedUserID, $targetUser['roomID']);
		}
		else
		{
			DB::query('UPDATE user SET lost = lost + 1 WHERE userID=%i AND ROOM_roomID=%i', $loggedUserID, $targetUser['roomID']);
			DB::query('UPDATE user SET won = won + 1 WHERE userID<>%i AND ROOM_roomID=%i', $loggedUserID, $targetUser['roomID']);
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
			parent::destroySession();
			return array('success' => false, 'error' => 'Your turn time is longer than ' . TURN_DURATION . ' seconds. It was: ' . ($timeInSeconds - GameLogic::getBeginningTurnTime()), 'errorType' => 'turnDurationError');
		}

		return null;
    }

    public static function checkIfTheRoomIsNotFull($users){
    	if(count($users) < ROOM_MAX_AMOUNT_OF_USERS)
    		return true;
    	return false; 
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
	public static function diagonallyDismissOpponents($prevX, $prevY, $newX, $newY, &$boardRows, $direction, &$removedPawnIds, &$errorMsg)
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

					$posEvaluation = parent::getPlayerNumber() === FIRST_PLAYER ? 
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
	public static function switchUserTurn($userOne, $userTwo){
		if($userOne['userID'] == parent::getLoggedUserID())
			return $userTwo['userID'];
		else if($userTwo['userID'] == parent::getLoggedUserID())
			return $userOne['userID'];
	}
}