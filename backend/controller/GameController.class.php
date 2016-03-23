<?php

require_once('BaseController.class.php');
require_once('../helper/ValidationHelper.class.php');

class GameController extends BaseController
{
	public static function checkWhoseTurn($roomID)
	{
		if(!parent::isUserLogged())
			return array('success' => false);

		parent::startConnection();
		$turn = DB::query('SELECT whose_turn FROM room WHERE roomID=%i', $roomID);

		if(count($turn) === 1)
		{
			$turn = $turn[0];
			$turn = $turn['whose_turn'];
		}
		else
			$turn = null;

		return array('success' => true, 'whoseTurn' => $turn, 'playerNumber' => parent::getPlayerNumber(), 'loggedUserID' => parent::getLoggedUserID());
	}
}