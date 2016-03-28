<?php

require_once('BaseController.class.php');
require_once('../helper/ValidationHelper.class.php');

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
	 * @param  Integer $roomID The database ID of the room. 
	 */
	public static function checkWhoseTurn($roomID)
	{
		if(!parent::isUserLogged())
			return array('success' => false);

		parent::startConnection();
		$turn = DB::query('SELECT whose_turn FROM room WHERE roomID=%i', $roomID);

		if(count($turn) === 1)
		{
			$turn = $turn[0];
			$turn = $turn['whose_turn'];
		}
		else
			$turn = null;

		return array('success' => true, 'whoseTurn' => $turn, 'playerNumber' => parent::getPlayerNumber(), 'loggedUserID' => parent::getLoggedUserID());
	}

	public static function evaluatePlayerMove($prevX, $prevY, $newX, $newY)
	{
		$prevX = intval($prevX);
		$prevY = intval($prevY);
		$newX = intval($newX);
		$newY = intval($newY);

		if(!parent::isUserLogged())
			return array('success' => false);

		//checking if the initial coordinate is positioned appropriately
		if(($prevY % 2) === 0)
		{
			if(($prevX % 2) !== 0)
				return array('success' => false, 'error' => 'The initial position [x='.$prevX.',y='.$prevY.'] should be divisable by two. ');
		}
		else
		{
			if(($prevX % 2) === 0)
				return array('success' => false, 'error' => 'The initial position [x='.$prevX.',y='.$prevY.'] should not be divisable by two. ');
		}

		//checking if the new coordinate is positioned appropriately
		if(($newY % 2) === 0)
		{
			if(($newX % 2) !== 0)
				return array('success' => false, 'error' => 'The new position [x='.$newX.',y='.$newY.'] should not be divisable by two. ');
		}
		else
		{
			if(($newX % 2) === 0)
				return array('success' => false, 'error' => 'The new position [x='.$newX.',y='.$newY.'] should be divisable by two. ');
		}

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
			return array('success' => false, 'error' => 'Illegally supplied previous position. ');

		//checking if the new position represents a pawn
		if($newPosition > 0)
			return array('success' => false, 'error' => 'New position should not be a pawn, but an empty field. ');

		#
		#
		#
		/* @TODO => Validate if the player pawn jumps recursively correctly over multiple opponet pawns. */
		#
		#
		#

		//setting the previous position to zero, indicating that the pawn has moved from that position
		$boardRows[$prevY][$prevX] = 0;

		//setting the destinated position equivalent to the previous position
		$boardRows[$newY][$newX] = $prevPosition;

		//reconstructing stringified board
		$newStringifiedBoard = "";
		foreach($boardRows as $boardRowKey => $boardRowVal)
		{
			$newStringifiedBoard .= implode(BOARD_COL_SEPARATOR, $boardRowVal);

			if($boardRowKey !== count($boardRows)-1)
				$newStringifiedBoard .= BOARD_ROW_SEPARATOR;
		}

		$users = DB::query("SELECT userID FROM user JOIN room ON(room.roomID = user.ROOM_roomID) WHERE roomID=%i", $targetRoom['roomID']);
		$newWhoseTurn = null;

		if(!empty($users) && count($users) === ROOM_MAX_AMOUNT_OF_USERS)
		{
			$userOne = $users[0];
			$userTwo = $users[1];

			if($targetRoom['whose_turn'] == parent::getLoggedUserID())
			{
				if($userOne['userID'] == parent::getLoggedUserID())
					$newWhoseTurn = $userTwo['userID'];
				else if($userTwo['userID'] == parent::getLoggedUserID())
					$newWhoseTurn = $userOne['userID'];
			}
		}
		else
			return array('success' => false);

		DB::update('room', array(
			'whose_turn' => $newWhoseTurn,
			'stringifiedBoard' => $newStringifiedBoard,
			'lastMove' => "{\"id\":".parent::getLoggedUserID().",\"prevX\":$prevX,\"prevY\":$prevY,\"newX\":$newX,\"newY\":$newY}"
		), 'roomID=%i', $targetRoom['roomID']);
		
		return array('success' => true, 'prevCoordinate' => "$prevX|$prevY", 'newCoordinate' => "$newX|$newY", 'playerNumber' => parent::getPlayerNumber(), 'stringifiedBoard' => $newStringifiedBoard);
	}

	/**
	 * Checks whether player's opponent already made their move. 
	 * @return Array Success flag indicating that it is indeed the player's turn, the player number value, and the last move in JSON format. 
	 */
	public static function checkIfOpponentIsDone()
	{
		if(!parent::isUserLogged())
			return array('success' => false);

		parent::startConnection();

		$users = DB::query("SELECT whose_turn, lastMove FROM user JOIN room ON(room.roomID = user.ROOM_roomID) WHERE userID=%s", parent::getLoggedUserID());
		if(!empty($users))
		{
			$targetUser = $users[0];

			if($targetUser['whose_turn'] == parent::getLoggedUserID())
				return array('success' => true, 'isDone' => true, 'playerNumber' => parent::getPlayerNumber(), 'lastMove' => $targetUser['lastMove']);
			return array('success' => true, 'isDone' => false);
		}
	}

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
}