<?php

require_once('BaseController.class.php');
require_once('../helper/ValidationHelper.class.php');

class RoomController extends BaseController
{
	public static function getAllRooms()
	{
		if(!parent::isUserLogged())
			return array('success' => false);

		parent::startConnection();
		$rooms = DB::query('SELECT roomID FROM room');

		return array('success' => true, 'rooms' => $rooms);
	}
}