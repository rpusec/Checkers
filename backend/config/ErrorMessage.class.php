<?php

/**
 * Returns a string representing an error 
 * message, converged with parameters. 
 * @author Roman Pusec
 */
class ErrorMessage{
	/**
	 * 
	 * @param  Number $userTurnTime      The time it took user to finish their move. 
	 * @param  Number $legalTurnDuration The legitimate maximum duration of a turn. 
	 * @return String                    Error message
	 */
	public static function createInvalidTurnDurationErrorMsg($userTurnTime, $legalTurnDuration){
		return 'Your turn time is longer than ' . $legalTurnDuration . ' seconds. It was: ' . $userTurnTime;
	}

	/**
	 * Creates an error message that has to do with players choosing an illegal position. 
	 * @param  Integer $xAxis             The X axis. 
	 * @param  Integer $yAxis             The Y axis. 
	 * @param  Integer $numToDiviseBy     Number to divide by. 
	 * @param  Boolean $shouldBeDivisible Should it be divisible by the message. 
	 * @param  Boolean $isNew             Is the position new or initial. 
	 * @return String                    The error message. 
	 */
	public static function createPosErrorMsg($xAxis, $yAxis, $numToDiviseBy, $shouldBeDivisible, $isNew){
		return 'The' . (!$isNew ? ' initial ' : ' ') . 'position [x='.$xAxis.',y='.$yAxis.'] should' . (!$shouldBeDivisible ? ' not ' : ' ') . 'be divisable by ' . $numToDiviseBy . '. ';
	}
}