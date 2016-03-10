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
		$results = DB::query("SELECT username, password FROM user WHERE username = %s AND password = %s", $username, $password);
		return array(
			'success' => count($results) === 1
		);
	}
}