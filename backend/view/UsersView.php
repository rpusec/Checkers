<?php 

require_once('../controller/UsersController.class.php');

if(isset($_POST['path']))
{
	switch(strtolower($_POST['path']))
	{
		case 'register-user' : 
			print json_encode(UsersController::registerUser($_POST['firstname'], $_POST['lastname'], $_POST['username'], $_POST['password']));
			break;
		case 'login-user' : 
			print json_encode(UsersController::loginUser($_POST['username'], $_POST['password']));
			break;
	}
}