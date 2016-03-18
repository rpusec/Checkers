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
	}
}