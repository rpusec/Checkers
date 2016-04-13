/**
 * Some AJAX calls have to be repeated throughout the application in order to update the game 
 * accordingly, this class contains all of the functions for setting the ajax call intervals. 
 * @class
 * @author Roman Pusec
 */
var AJAXCallIntervalHandler = {};

(function(){

	var	checkForOpponentInterval
	,	checkRoomAvailabilityInterval
	,	checkIfOpponentIsDoneInterval
	,	checkIfAPlayerLeftInterval;

	/**
	 * Checks if the player's opponent joined the game. 
	 */
	AJAXCallIntervalHandler.setCheckForOpponentInterval = function(){
		checkForOpponentInterval = setInterval(function(){
			AJAXCallHandler.checkForOpponentAJAXCall();
		}, Constants.CHECK_OPPONENT_INTERVAL_DURATION);
	}

	/**
	 * Checks the availability of all of the game rooms. 
	 */
	AJAXCallIntervalHandler.setCheckRoomAvailabilityInterval = function(){
		checkRoomAvailabilityInterval = setInterval(function(){
			AJAXCallHandler.checkGameRoomAvailabilityAJAXCall();
		}, Constants.CHECK_ROOM_AVAILABILITY_INTERVAL_DURATION);
	}

	/**
	 * Checks whether the opponent is done with their turn. 
	 */
	AJAXCallIntervalHandler.setCheckIfOpponentIsDoneInterval = function(){
		checkIfOpponentIsDoneInterval = setInterval(function(){
			AJAXCallHandler.checkIfOpponentIsDoneAJAXCall();
		}, Constants.CHECK_IF_OPPONENT_IS_DONE_INTERVAL_DURATION);
	}

	/**
	 * Checks whether the opponent left. 
	 */
	AJAXCallIntervalHandler.setCheckIfAPlayerLeftInterval = function(){
		checkIfAPlayerLeftInterval = setInterval(function(){
			AJAXCallHandler.checkIfAPlayerLeftAJAXCall();
		}, Constants.CHECK_IF_A_PLAYER_LEFT_INTERVAL_DURATION);
	}

	/**
	 * Clears the interval for checking whether an opponent entered the game. 
	 */
	AJAXCallIntervalHandler.clearCheckForOpponentInterval = function(){ 
		clearInterval(checkForOpponentInterval); 
	}

	/**
	 * Clears the interval for checking the availability of all of the game rooms. 
	 */
	AJAXCallIntervalHandler.clearCheckRoomAvailabilityInterval = function(){ 
		clearInterval(checkRoomAvailabilityInterval); 
	}
	
	/**
	 * Clears the interval for whether the opponent is done with their turn. 
	 */
	AJAXCallIntervalHandler.clearCheckIfOpponentIsDoneInterval = function(){ 
		clearInterval(checkIfOpponentIsDoneInterval); 
	}

	/**
	 * Clears the interval for whether the opponent left the game.  
	 */
	AJAXCallIntervalHandler.clearCheckIfAPlayerLeftInterval = function(){ 
		clearInterval(checkIfAPlayerLeftInterval); 
	}

	/**
	 * Clears all of the intervals associated with this class. 
	 */
	AJAXCallIntervalHandler.clearAllAJAXCallIntervals = function(){
		clearInterval(checkForOpponentInterval);
		clearInterval(checkRoomAvailabilityInterval);
		clearInterval(checkIfOpponentIsDoneInterval);
		clearInterval(checkIfAPlayerLeftInterval);
	}

}());