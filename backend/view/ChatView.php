<?php 

require_once('../controller/ChatController.class.php');

if(isset($_POST['path']))
{
	switch(strtolower($_POST['path']))
	{
		case 'send-message' : 
			print json_encode(ChatController::addMessage($_POST['message']));
			break;
	}
}
else if(isset($_GET['path']))
{
	switch(strtolower($_GET['path']))
	{
		case 'get-message' : 
			print json_encode(ChatController::getMessages());
			break;
	}
}