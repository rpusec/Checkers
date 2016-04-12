<?php

require_once('BaseController.class.php');
require_once('RoomController.class.php');
require_once('GameLogic.class.php');

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
		GameLogic::setBeginningTurnTime();

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
		$rooms = DB::query("SELECT roomID, stringifiedBoard, whose_turn FROM room JOIN user ON(user.ROOM_roomID = room.roomID) WHERE userID=%i", parent::getLoggedUserID());

		if(empty($rooms))
			return array('success' => false);

		$targetRoom = $rooms[0];

		$checkIfPlayerTurn = GameLogic::checkIfPlayerTurn($targetRoom);
		
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
		$diagonallyDissOppErrorMsg = "";
		GameLogic::diagonallyDismissOpponents($prevX, $prevY, $newX, $newY, $boardRows, self::DIAGONALLY_DISMISS_OPPONENTS_LEFT_UP_DIR, $removedPawnIds, $diagonallyDissOppErrorMsg);
		
		if(empty($removedPawnIds))
			GameLogic::diagonallyDismissOpponents($prevX, $prevY, $newX, $newY, $boardRows, self::DIAGONALLY_DISMISS_OPPONENTS_RIGHT_UP_DIR, $removedPawnIds, $diagonallyDissOppErrorMsg);
		
		if(empty($removedPawnIds))
			GameLogic::diagonallyDismissOpponents($prevX, $prevY, $newX, $newY, $boardRows, self::DIAGONALLY_DISMISS_OPPONENTS_LEFT_DOWN_DIR, $removedPawnIds, $diagonallyDissOppErrorMsg);
		
		if(empty($removedPawnIds))
			GameLogic::diagonallyDismissOpponents($prevX, $prevY, $newX, $newY, $boardRows, self::DIAGONALLY_DISMISS_OPPONENTS_RIGHT_DOWN_DIR, $removedPawnIds, $diagonallyDissOppErrorMsg);
		
		//if there had been an error in the process, forward the error
		if($diagonallyDissOppErrorMsg !== "")
			return array('success' => false, 'error' => $diagonallyDissOppErrorMsg);

		//setting the previous position to zero, indicating that the pawn has moved from that position
		$boardRows[$prevY][$prevX] = 0;

		//setting the destinated position equivalent to the previous position
		$boardRows[$newY][$newX] = $prevPosition;
		
		$playerOnePawns = 0;
		$playerTwoPawns = 0;
		$newStringifiedBoard = GameLogic::createModifiedStringifiedBoard($boardRows, $playerOnePawns, $playerTwoPawns);

		$newWhoseTurn = GameLogic::setOpponentTurn($targetRoom, parent::getLoggedUserID(), $users);

		$checkTurnDuration = GameLogic::checkTurnDuration(parent::getTimeInSec());
		if(is_array($checkTurnDuration))
			return $checkTurnDuration;

		$winner = GameLogic::checkForWinner($playerOnePawns, $playerTwoPawns);

		DB::update('room', array(
			'whose_turn' => $newWhoseTurn,
			'stringifiedBoard' => $newStringifiedBoard,
			'lastMove' => "{\"id\":".parent::getLoggedUserID().",\"prevX\":$prevX,\"prevY\":$prevY,\"newX\":$newX,\"newY\":$newY}",
			'removedPawns' => json_encode($removedPawnIds)
		), 'roomID=%i', $targetRoom['roomID']);
		
		return array('success' => true, 'prevCoordinate' => "$prevX|$prevY", 'newCoordinate' => "$newX|$newY", 'playerNumber' => parent::getPlayerNumber(), 'removedPawns' => $removedPawnIds, 'winner' => $winner);
	}

	/**
	 * Checks whether player's opponent already made their move. 
	 * @return [Array] Success flag indicating that it is indeed the player's turn, the player number value, and the last move in JSON format. 
	 */
	public static function checkIfOpponentIsDone()
	{
		if(!parent::isUserLogged())
			return array('success' => false);

		parent::startConnection();

		$users = DB::query("SELECT roomID, whose_turn, lastMove, removedPawns FROM user JOIN room ON(room.roomID = user.ROOM_roomID) WHERE userID=%s", parent::getLoggedUserID());
		if(!empty($users))
		{
			$targetUser = $users[0];

			if($targetUser['whose_turn'] == parent::getLoggedUserID())
			{
				$stringifiedBoard = DB::query("SELECT stringifiedBoard FROM room WHERE roomID=%i", $targetUser['roomID']);
				$boardRowStrArr = explode(BOARD_ROW_SEPARATOR, $stringifiedBoard[0]['stringifiedBoard']);

				$playerTwoPawns = 0;
				$playerOnePawns = 0;

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

				$winner = GameLogic::checkForWinner($playerOnePawns, $playerTwoPawns);

				if($winner !== null)
				{
					DB::update('room', array(
						'stringifiedBoard' => RoomController::constructStringifiedBoard()
					), 'roomID=%i', $targetUser['roomID']);

					if($winner === parent::getPlayerNumber())
					{
						DB::query('UPDATE user SET won = won + 1 WHERE userID=%i AND ROOM_roomID=%i', parent::getLoggedUserID(), $targetUser['roomID']);
						DB::query('UPDATE user SET lost = lost + 1 WHERE userID<>%i AND ROOM_roomID=%i', parent::getLoggedUserID(), $targetUser['roomID']);
					}
					else
					{
						DB::query('UPDATE user SET lost = lost + 1 WHERE userID=%i AND ROOM_roomID=%i', parent::getLoggedUserID(), $targetUser['roomID']);
						DB::query('UPDATE user SET won = won + 1 WHERE userID<>%i AND ROOM_roomID=%i', parent::getLoggedUserID(), $targetUser['roomID']);
					}
				}
				
				GameLogic::setBeginningTurnTime();
				return array('success' => true, 'isDone' => true, 'playerNumber' => parent::getPlayerNumber(), 'lastMove' => $targetUser['lastMove'], 'removedPawns' => $targetUser['removedPawns'], 'winner' => $winner);
			}

			return array('success' => true, 'isDone' => false);
		}
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

		$roomFromUser = DB::query("SELECT roomID FROM room JOIN user ON(room.roomID = user.ROOM_roomID) WHERE userID=%i", parent::getLoggedUserID());

		if(empty($roomFromUser))
			return array('success' => false);

		$targetRoomID = $roomFromUser[0];
		$targetRoomID = $targetRoomID['roomID'];
		$users = DB::query("SELECT userID FROM room JOIN user ON(room.roomID = user.ROOM_roomID) WHERE roomID=%i", $targetRoomID);
		
		$shouldExitRoom = false;
		if(count($users) < ROOM_MAX_AMOUNT_OF_USERS)
			$shouldExitRoom = true;

		return array('success' => true, 'shouldExitRoom' => $shouldExitRoom);
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

		$rooms = DB::query("SELECT roomID, whose_turn FROM room JOIN user ON(user.ROOM_roomID = room.roomID) WHERE userID=%i", parent::getLoggedUserID());

		if(!empty($rooms))
			$targetRoom = $rooms[0];
		else
			return array('success' => false);

		$users = DB::query("SELECT userID FROM user JOIN room ON(room.roomID = user.ROOM_roomID) WHERE roomID=%i", $targetRoom['roomID']);
		$newWhoseTurn = null;

		if(!empty($users) && count($users) === ROOM_MAX_AMOUNT_OF_USERS)
			$newWhoseTurn = GameLogic::switchUserTurn($users[0], $users[1]);
		else
			return array('success' => false);

		DB::update('room', array(
			'whose_turn' => $newWhoseTurn,
			'lastMove' => null,
			'removedPawns' => null
		), 'roomID=%i', $targetRoom['roomID']);

		return array('success' => true);
	}
}