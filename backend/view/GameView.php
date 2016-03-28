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
		case 'evaluate-player-move' : 
			print json_encode(GameController::evaluatePlayerMove($_GET['prevX'], $_GET['prevY'], $_GET['newX'], $_GET['newY']));
			break;
		case 'check-if-opponent-is-done' : 
			print json_encode(GameController::checkIfOpponentIsDone());
			break;
		case 'check-if-a-player-left' : 
			print json_encode(GameController::checkIfAPlayerLeft());
			break;
	}
}