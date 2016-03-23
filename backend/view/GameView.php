<?php 

require_once('../controller/GameController.class.php');

session_start();

if(isset($_GET['path']))
{
	switch(strtolower($_GET['path']))
	{
		case 'check-whose-turn' : 
			print json_encode(GameController::checkWhoseTurn($_GET['gameRoomID']));
			break;
	}
}