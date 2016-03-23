<?php 

require_once('../controller/GameController.class.php');

session_start();

if(isset($_GET['path']))
{
	switch(strtolower($_GET['path']))
	{
		case 'update-game' : 
			//print json_encode(GameController::updateGame());
			break;
	}
}