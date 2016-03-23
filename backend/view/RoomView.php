<?php 

require_once('../controller/RoomController.class.php');

session_start();

if(isset($_POST['path']))
{
	//TODO
}
else if(isset($_GET['path']))
{
	switch(strtolower($_GET['path']))
	{
		case 'get-all-rooms' : 
			print json_encode(RoomController::getAllRooms());
			break;
		case 'add-to-game-room' : 
			if(!isset($_GET['gameRoomID']))
				$_GET['gameRoomID'] = null;
			print json_encode(RoomController::addUserToGameRoom($_GET['gameRoomID']));
			break;
		case 'remove-from-game-room' : 
			print json_encode(RoomController::removeFromGameRoom());
			break;
		case 'check-for-opponent' : 
			print json_encode(RoomController::checkForOpponent());
			break;
	}
}