<?php 

require_once('../controller/GameController.class.php');

session_start();

if(isset($_GET['path']))
{
	switch(strtolower($_GET['path']))
	{
		case 'add-to-game-room' : 
			if(!isset($_GET['gameRoomID']))
				$_GET['gameRoomID'] = null;

			print json_encode(GameController::addUserToGameRoom($_GET['gameRoomID']));
			break;
	}
}