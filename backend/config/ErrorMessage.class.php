<?php

class ErrorMessage{
	public static function createNoLongerYourTurnErrorMsg($userTurnTime){
		return 'Your turn time is longer than ' . TURN_DURATION . ' seconds. It was: ' . $userTurnTime;
	}

	public static function createInitialPosErrorMesg($xAxis, $yAxis, $numToDiviseBy){
		return 'The initial position [x='.$xAxis.',y='.$yAxis.'] should be divisable by ' . $numToDiviseBy . '. ';
	}
}