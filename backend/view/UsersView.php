<?php 

require_once('../controller/UsersController.class.php');

if(isset($_POST['path']))
{
	switch(strtolower($_POST['path']))
	{
		case 'register-user' : 
			print json_encode(UsersController::registerUser($_POST['firstname'], $_POST['lastname'], $_POST['username'], $_POST['password'], $_POST['passwordConfirm']));
			break;
		case 'login-user' : 
			print json_encode(UsersController::loginUser($_POST['username'], $_POST['password']));
			break;
	}
}
else if(isset($_GET['path']))
{
	switch(strtolower($_GET['path']))
	{
		case 'is-user-logged' : 
			print json_encode(UsersController::isUserLogged());
			break;
		case 'log-user-out' : 
			print json_encode(UsersController::logoutUser());
			break;
	}
}