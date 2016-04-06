<?php

require_once('BaseController.class.php');
require_once('RoomController.class.php');
require_once('../helper/ValidationHelper.class.php');
require_once('UsersController.class.php');

/**
 * Controller class which provides all functionality
 * relating to the functionality of the game itself. 
 * @author Roman Pusec
 */
class GameController extends BaseController
{
	const DIAGONALLY_DISMISS_OPPONENTS_LEFT_UP_DIR = 0;
	const DIAGONALLY_DISMISS_OPPONENTS_RIGHT_UP_DIR = 1;
	const DIAGONALLY_DISMISS_OPPONENTS_LEFT_DOWN_DIR = 2;
	const DIAGONALLY_DISMISS_OPPONENTS_RIGHT_DOWN_DIR = 3;

	const MIN_POSITION = 2;
	const MAX_POSITION = 8;
	const ILLEGAL_POS_TEXT = 'Illegal position: ';

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
		$turn = DB::query('SELECT whose_turn FROM room WHERE roomID=%i', $roomID);

		if(!empty($turn))
		{
			$turn = $turn[0];
			$turn = intval($turn['whose_turn']);
		}
		else
			$turn = null;

		self::setBeginningTurnTime();

		return array('success' => true, 'whoseTurn' => $turn, 'playerNumber' => parent::getPlayerNumber(), 'loggedUserID' => parent::getLoggedUserID());
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

		$prevCoor = self::isCoordinateInitializedAppropriately($prevX, $prevY, 2);
		$nextCoor = self::isCoordinateInitializedAppropriately($newX, $newY, 2);

		if(is_array($prevCoor))
			return $prevCoor;

		if(is_array($nextCoor))
			return $nextCoor;

		parent::startConnection();
		$rooms = DB::query("SELECT roomID, stringifiedBoard, whose_turn FROM room JOIN user ON(user.ROOM_roomID = room.roomID) WHERE userID=%i", parent::getLoggedUserID());

		if(empty($rooms))
			return array('success' => false);

		$targetRoom = $rooms[0];

		//checking if it is the user's turn
		$whoseTurn = $targetRoom['whose_turn'];
		if($whoseTurn !== parent::getLoggedUserID())
			return array('success' => false, 'error' => 'It\'s not your turn. ');

		$boardStr = $targetRoom['stringifiedBoard'];

		$boardRowsExpl = explode(BOARD_ROW_SEPARATOR, $boardStr);
		$boardRows = array();

		//converting from stringified board rows to actual array of board rows
		foreach($boardRowsExpl as $boardRow)
			$boardRows[] = explode(BOARD_COL_SEPARATOR, $boardRow);

		$prevPosition = intval($boardRows[$prevY][$prevX]);

		//previous position should not be zero
		if($prevPosition === 0)
			return array('success' => false, 'error' => 'Illegally supplied previous position. ');

		//checking whether the pawn the user wants to move is 
		//their actual pawn
		if(parent::getPlayerNumber() === FIRST_PLAYER)
		{
			if($prevPosition > PLAYER_PAWNS_AMOUNT)
				return array('success' => false, 'error' => 'The pawn is not yours. ');
		}
		else if(parent::getPlayerNumber() === SECOND_PLAYER)
		{
			if($prevPosition <= PLAYER_PAWNS_AMOUNT)
				return array('success' => false, 'error' => 'The pawn is not yours. ');
		}

		$newPosition = intval($boardRows[$newY][$newX]);

		//checking if the new position is equivalend to the old one, which should not happen
		if($newPosition === $prevPosition)
			return array('success' => false, 'error' => 'Previous position should not be equivalent to the new position. ');

		//checking if the new position represents a pawn
		if($newPosition > 0)
			return array('success' => false, 'error' => 'New position should not be a pawn, but an empty field. ');

		//checks if opponent's pawns should be removed and also whether the player 
		//chose an illegal position when searching for opponent's pawns
		$removedPawnIds = array();
		$diagonallyDissOppErrorMsg = "";
		self::diagonallyDismissOpponents($prevX, $prevY, $newX, $newY, $boardRows, self::DIAGONALLY_DISMISS_OPPONENTS_LEFT_UP_DIR, $removedPawnIds, $diagonallyDissOppErrorMsg);
		
		if(empty($removedPawnIds))
			self::diagonallyDismissOpponents($prevX, $prevY, $newX, $newY, $boardRows, self::DIAGONALLY_DISMISS_OPPONENTS_RIGHT_UP_DIR, $removedPawnIds, $diagonallyDissOppErrorMsg);
		
		if(empty($removedPawnIds))
			self::diagonallyDismissOpponents($prevX, $prevY, $newX, $newY, $boardRows, self::DIAGONALLY_DISMISS_OPPONENTS_LEFT_DOWN_DIR, $removedPawnIds, $diagonallyDissOppErrorMsg);
		
		if(empty($removedPawnIds))
			self::diagonallyDismissOpponents($prevX, $prevY, $newX, $newY, $boardRows, self::DIAGONALLY_DISMISS_OPPONENTS_RIGHT_DOWN_DIR, $removedPawnIds, $diagonallyDissOppErrorMsg);
		
		//if there had been an error in the process, forward the error
		if($diagonallyDissOppErrorMsg !== "")
			return array('success' => false, 'error' => $diagonallyDissOppErrorMsg);

		//setting the previous position to zero, indicating that the pawn has moved from that position
		$boardRows[$prevY][$prevX] = 0;

		//setting the destinated position equivalent to the previous position
		$boardRows[$newY][$newX] = $prevPosition;
				
				$playerOnePawns = 0;
				$playerTwoPawns = 0;
				
		//reconstructing stringified board
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

		$users = DB::query("SELECT userID FROM user JOIN room ON(room.roomID = user.ROOM_roomID) WHERE roomID=%i", $targetRoom['roomID']);
		$newWhoseTurn = null;

		//setting the opponent's turn
		if(!empty($users) && count($users) === ROOM_MAX_AMOUNT_OF_USERS)
			if($targetRoom['whose_turn'] == parent::getLoggedUserID())
				$newWhoseTurn = self::switchUserTurn($users[0], $users[1]);
		else
			return array('success' => false);

		//checks if the turn duration is legal, that is, if it's not less than the specified coordinate 
		if((parent::getTimeInSec() - self::getBeginningTurnTime()) > TURN_DURATION)
		{
			UsersController::logoutUser(false);
			parent::destroySession();
			return array('success' => false, 'error' => 'Your turn time is longer than ' . TURN_DURATION . ' seconds. It was: ' . (parent::getTimeInSec() - self::getBeginningTurnTime()), 'errorType' => 'turnDurationError');
		}
				
		if($playerOnePawns === 0 && $playerTwoPawns !== 0)
			$winner = SECOND_PLAYER;
		else if($playerOnePawns !== 0 && $playerTwoPawns === 0)
			$winner = FIRST_PLAYER;
		else
			$winner = null;

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

				if($playerOnePawns === 0 && $playerTwoPawns !== 0)
					$winner = SECOND_PLAYER;
				else if($playerOnePawns !== 0 && $playerTwoPawns === 0)
					$winner = FIRST_PLAYER;
				else
					$winner = null;

				if($winner !== null)
				{
					DB::update('room', array(
						'stringifiedBoard' => RoomController::constructStringifiedBoard()
					), 'roomID=%i', $targetUser['roomID']);
				}
				
				self::setBeginningTurnTime();
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
			$newWhoseTurn = self::switchUserTurn($users[0], $users[1]);
		else
			return array('success' => false);

		DB::update('room', array(
			'whose_turn' => $newWhoseTurn,
			'lastMove' => null,
			'removedPawns' => null
		), 'roomID=%i', $targetRoom['roomID']);

		return array('success' => true);
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
	private static function diagonallyDismissOpponents($prevX, $prevY, $newX, $newY, &$boardRows, $direction, &$removedPawnIds, &$errorMsg)
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
	 * Sets the beginning turn time. This value will help evaluate whether 
	 * the time it took for player to finish their move was legal. The value
	 * that's set is the current time in seconds. 
	 */
	private static function setBeginningTurnTime(){
		$_SESSION['beginningTurnTime'] = parent::getTimeInSec();
	}

	/**
	 * Returns the turn time. 
	 * @return [Integer] Turn time. 
	 */
	private static function getBeginningTurnTime(){
		return isset($_SESSION['beginningTurnTime']) ? $_SESSION['beginningTurnTime'] : null;
	}

	/**
	 * Checks whether the coordinate is positioned accurately. 
	 * @param  [Integer]  $xAxis         The X axis. 
	 * @param  [Integer]  $yAxis         The Y axis. 
	 * @param  [Integer]  $numToDiviseBy The number to divide by. 
	 * @return Array                  If it was an illegal move, it'll return an array with a success flag and the error message, otherwise it'll return null.  
	 */
	private static function isCoordinateInitializedAppropriately($xAxis, $yAxis, $numToDiviseBy){
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

	/**
	 * Switches the turn from one player to another. The first two 
	 * parameters have to be the users directly fetched from the database. 
	 * @param  [Array]   $userOne       The first user. 
	 * @param  [Array]   $userTwo       The second user. 
	 * @return [Integer]                The ID of the user who's turn it is. 
	 */
	private static function switchUserTurn($userOne, $userTwo){
		if($userOne['userID'] == parent::getLoggedUserID())
			return $userTwo['userID'];
		else if($userTwo['userID'] == parent::getLoggedUserID())
			return $userOne['userID'];
	}
		
		private static function checkWinningStatus()
		{
			if(!parent::isUserLogged())
				return array('success' => false);
			
			
		}
}