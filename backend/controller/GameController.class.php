<?php

require_once('BaseController.class.php');
require_once('../business/GameLogic.class.php');

/**
 * Controller class which provides all functionality
 * relating to the functionality of the game itself. 
 * @author Roman Pusec
 */
class GameController extends BaseController
{
	/**
	 * Notifies the client side of who's turn it is in the game. 
	 * The 'whoseTurn' value represents the ID value of the user
	 * who's turn it is in the game.  
	 * @param  [Integer] $roomID The database ID of the room. 
	 */
	public static function checkWhoseTurn($roomID)
	{
		if(!parent::isUserLogged())
			return array('success' => false);

		parent::startConnection();
		$turn = GameLogic::getPlayerTurn($roomID);
		GameLogic::setBeginningTurnTime(parent::getTimeInSec());

		return array(
			'success' => true, 
			'whoseTurn' => $turn, 
			'playerNumber' => parent::getPlayerNumber(), 
			'loggedUserID' => parent::getLoggedUserID());
	}

	/**
	 * Determines if the move that the player had made is legal, in the sense that it obeys the rules
	 * of the game checkers. 
	 *
	 * It looks for the following illegal actions: 
	 * - Whether the player chose a position where there already is a pawn. 
	 * - Whether the player chose a position that is marked by a white square, instead of a black square. 
	 * - Whether the player chose a position that is the same as the position of the pawn they have selected. 
	 * - Whether the player selected an appropriate position when diagonally searching for opponent's squares to kill them off. 
	 *
	 * The function then updates the stringified board in the database, afterwards it adds the 'move' that the player 
	 * made in the database, so that the opponent can see it. 
	 * Lastly, the function also marks in the database that it is the opponent's turn in the game. 
	 *
	 * The function also checks whether the turn duration is legitimate, that is, if it's less or 
	 * equal to the TURN_DURATION constant. If it's not, then the player will be kicked out of the game.  
	 * 
	 * @param  [Integer] $prevX The initial position on the X-axis of the target pawn. 
	 * @param  [Integer] $prevY The initial position on the Y-axis of the target pawn. 
	 * @param  [Integer] $newX  The new position on the X-axis of the target pawn. 
	 * @param  [Integer] $newY  The new position on the Y-axis of the target pawn. 
	 * @return [Array]          Success flag, previous and new pawn position, the player number of the user, the array of id values of killed off pawns. 
	 */
	public static function evaluatePlayerMove($prevX, $prevY, $newX, $newY)
	{
		$prevX = intval($prevX);
		$prevY = intval($prevY);
		$newX = intval($newX);
		$newY = intval($newY);

		if(!parent::isUserLogged())
			return array('success' => false);

		$prevCoor = GameLogic::isCoordinateInitializedAppropriately($prevX, $prevY, 2);
		$nextCoor = GameLogic::isCoordinateInitializedAppropriately($newX, $newY, 2);

		if(is_array($prevCoor))
			return $prevCoor;
		if(is_array($nextCoor))
			return $nextCoor;

		parent::startConnection();
		$targetRoom = GameLogic::getAllRoomInfoByUserID(parent::getLoggedUserID());

		if($targetRoom === null)
			return array('success' => false);

		$checkIfPlayerTurn = GameLogic::checkIfPlayerTurn($targetRoom, parent::getLoggedUserID());
		
		if(is_array($checkIfPlayerTurn))
			return $checkIfPlayerTurn;

		$boardStr = $targetRoom['stringifiedBoard'];
		$boardRowsExpl = explode(BOARD_ROW_SEPARATOR, $boardStr);
		$boardRows = array();

		//converting from stringified board rows to actual array of board rows
		foreach($boardRowsExpl as $boardRow)
			$boardRows[] = explode(BOARD_COL_SEPARATOR, $boardRow);

		$prevPosition = intval($boardRows[$prevY][$prevX]);
		$newPosition = intval($boardRows[$newY][$newX]);

		$checkIfPrevPosIsNotAPawn = GameLogic::checkIfPrevPosIsNotAPawn($prevPosition);
		$checkIfActualUserPawn = GameLogic::checkIfActualUserPawn($prevPosition, parent::getPlayerNumber());
		$checkIfPrevPosEqualToNewOne = GameLogic::checkIfPrevPosEqualToNewOne($newPosition, $prevPosition);
		$checkIfNewPosRepresentsAPawn = GameLogic::checkIfNewPosRepresentsAPawn($newPosition);
		
		if(is_array($checkIfPrevPosIsNotAPawn))
			return $checkIfPrevPosIsNotAPawn;
		if(is_array($checkIfActualUserPawn))
			return $checkIfActualUserPawn;
		if(is_array($checkIfPrevPosEqualToNewOne))
			return $checkIfPrevPosEqualToNewOne;
		if(is_array($checkIfNewPosRepresentsAPawn))
			return $checkIfNewPosRepresentsAPawn;

		//checks if opponent's pawns should be removed and also whether the player 
		//chose an illegal position when searching for opponent's pawns
		$removedPawnIds = array();

		//if there had been an error in the process, forward the error
		$diagonallyDissOppErrorMsg = "";
		GameLogic::diagonallyDismissOpponentsAllSides($prevX, $prevY, $newX, $newY, parent::getPlayerNumber(), $boardRows, $removedPawnIds, $diagonallyDissOppErrorMsg);
		if($diagonallyDissOppErrorMsg !== "")
			return array('success' => false, 'error' => $diagonallyDissOppErrorMsg);

		//setting the previous position to zero, indicating that the pawn has moved from that position
		$boardRows[$prevY][$prevX] = 0;

		//setting the destinated position equivalent to the previous position
		$boardRows[$newY][$newX] = $prevPosition;
		
		$playerOnePawns = 0;
		$playerTwoPawns = 0;
		$newStringifiedBoard = GameLogic::createModifiedStringifiedBoard($boardRows, $playerOnePawns, $playerTwoPawns);

		$newWhoseTurn = GameLogic::setOpponentTurn($targetRoom, parent::getLoggedUserID());

		$checkTurnDuration = GameLogic::checkTurnDuration(parent::getTimeInSec());
		if(is_array($checkTurnDuration))
		{
			parent::destroySession();
			return $checkTurnDuration;
		}

		$winner = GameLogic::checkForWinner($playerOnePawns, $playerTwoPawns);

		GameLogic::updateRoom(array(
			'whoseTurn' => $newWhoseTurn, 
			'stringifiedBoard' => $newStringifiedBoard, 
			'lastMove' => "{\"id\":".parent::getLoggedUserID().",\"prevX\":$prevX,\"prevY\":$prevY,\"newX\":$newX,\"newY\":$newY}", 
			'removedPawns' => json_encode($removedPawnIds)
		), $targetRoom['roomID']);
		
		return array('success' => true, 'prevCoordinate' => "$prevX|$prevY", 'newCoordinate' => "$newX|$newY", 'playerNumber' => parent::getPlayerNumber(), 'removedPawns' => $removedPawnIds, 'winner' => $winner);
	}

	/**
	 * Checks whether player's opponent already made their move, if they have, then the database is updated accordingly. 
	 * @return [Array] Success flag indicating that it is indeed the player's turn, the player number value, and the last move in JSON format. 
	 */
	public static function checkIfOpponentIsDone()
	{
		if(!parent::isUserLogged())
			return array('success' => false);

		parent::startConnection();

		$targetRoom = GameLogic::getAllRoomInfoByUserID(parent::getLoggedUserID());
		if($targetRoom !== null)
		{
			if($targetRoom['whoseTurn'] == parent::getLoggedUserID())
			{
				$stringifiedBoard = GameLogic::getStringBoard($targetRoom['roomID']);
				$boardRowStrArr = explode(BOARD_ROW_SEPARATOR, $stringifiedBoard['stringifiedBoard']);
				
				$playerOnePawns = 0;
				$playerTwoPawns = 0;
				GameLogic::countPlayerOneTwoPawns($boardRowStrArr, $playerOnePawns, $playerTwoPawns);

				$winner = GameLogic::checkForWinner($playerOnePawns, $playerTwoPawns);

				if($winner !== null)
					GameLogic::updateWonLoseState($targetRoom, parent::getLoggedUserID(), parent::getPlayerNumber(), $winner);

				GameLogic::setBeginningTurnTime(parent::getTimeInSec());
				return array('success' => true, 'isDone' => true, 'playerNumber' => parent::getPlayerNumber(), 'lastMove' => $targetRoom['lastMove'], 'removedPawns' => $targetRoom['removedPawns'], 'winner' => $winner);
			}

			return array('success' => true, 'isDone' => false);
		}

		return array('success' => false);
	}

	/**
	 * Checks whether the opponent left the game. If everything went well, it returns 
	 * a boolean indicating whether the player should exit the room or not. 
	 * @return [Array] A success flag indicating whether everything went well, and a boolean indicating whether the player had left the game. 
	 */
	public static function checkIfAPlayerLeft()
	{
		if(!parent::isUserLogged())
			return array('success' => false);

		parent::startConnection();

		$targetRoom = GameLogic::getRoomIDFromUser(parent::getLoggedUserID());
		if($targetRoom === null)
			return array('success' => false);

		$targetRoomID = $targetRoom['roomID'];
		$users = GameLogic::getUserIDsFromRoom($targetRoomID);
		$checkIfTheRoomIsNotFull = GameLogic::checkIfTheRoomIsNotFull($users);

		return array('success' => true, 'shouldExitRoom' => $checkIfTheRoomIsNotFull);
	}

	/**
	 * Executes when the turn timeout runs out. When that happens, the method 
	 * then sets the turn to the opponent on the database.  
	 * @return [Array] Success flag indicating whether everything went as expected. 
	 */
	public static function notifyTurnTimeout(){
		if(!parent::isUserLogged())
			return array('success' => false);

		parent::startConnection();
		
		$targetRoom = GameLogic::getRoomIDAndWhoseTurnByUser(parent::getLoggedUserID());
		if($targetRoom === null)
			return array('success' => false);

		$newWhoseTurn = GameLogic::setOpponentTurn($targetRoom, parent::getLoggedUserID());

		GameLogic::updateRoom(array(
			'whoseTurn' => $newWhoseTurn, 
			'lastMove' => null, 
			'removedPawns' => null
		), $targetRoom['roomID']);

		return array('success' => true);
	}
}