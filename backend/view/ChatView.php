<?php 

require_once('../controller/ChatController.class.php');

if(isset($_POST['path']))
{
	switch(strtolower($_POST['path']))
	{
		case 'send-message' : 
			print json_encode(ChatController::addMessage(1, $_POST['message']));
			break;
	}
}
if(isset($_GET['path']))
{
	switch(strtolower($_GET['path']))
	{
		case 'get-message' : 
			print json_encode(ChatController::getMessages());
			break;
	}
}