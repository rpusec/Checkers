<?php

require_once('BaseController.class.php');

class UsersController extends BaseController
{
	public static function registerUser($firstname, $lastname, $username, $password)
	{
		parent::startConnection();

		DB::insert('user', array(
			'fname' => $firstname,
			'lname' => $lastname,
			'username' => $username,
			'password' => $password
		));

		return array(
			'affectedRows' => DB::affectedRows()
		);
	}

	public static function loginUser($username, $password)
	{
		parent::startConnection();
		$results = DB::query("SELECT userID, username, password FROM user WHERE username = %s AND password = %s", $username, $password);
		$res = false;

		if(count($results) === 1)
		{
			$targetUser = $results[0];
			if($targetUser['username'] === $username && $targetUser['password'] === $password)
			{
				session_start();
				$_SESSION["userID"] = $targetUser['userID'];
				$res = true;
			}
		}

		return array('success' => $res);
	}

	public static function isUserLogged(){
		return array('isLogged' => parent::isUserLogged());
	}

	public static function logoutUser()
	{
		if(!parent::isUserLogged())
			return array('success' => false, 'message' => USER_LOGOUT_ERROR_MSG);

		unset($_SESSION["userID"]);
		return array('success' => true, 'message' => USER_LOGOUT_MSG);
	}
}