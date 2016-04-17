/**
 * Some AJAX calls have to be repeated throughout the application in order to update the game 
 * accordingly, this class contains all of the functions for setting the ajax call intervals. 
 * @class
 * @author Roman Pusec
 * @namespace rpcheckers.game.ajax
 */
rpcheckers.game.ajax.AJAXCallIntervalHandler = {};

(function(){

	var	ns = rpcheckers.game.ajax.AJAXCallIntervalHandler
	,	AJAXCallHandler;

	var	checkForOpponentInterval
	,	checkRoomAvailabilityInterval
	,	checkIfOpponentIsDoneInterval
	,	checkIfAPlayerLeftInterval;

	ns.initialize = function(){
		AJAXCallHandler = rpcheckers.game.ajax.AJAXCallHandler
	}

	/**
	 * Checks if the player's opponent joined the game. 
	 */
	ns.setCheckForOpponentInterval = function(){
		checkForOpponentInterval = setInterval(function(){
			AJAXCallHandler.checkForOpponentAJAXCall();
		}, Constants.CHECK_OPPONENT_INTERVAL_DURATION);
	}

	/**
	 * Checks the availability of all of the game rooms. 
	 */
	ns.setCheckRoomAvailabilityInterval = function(){
		checkRoomAvailabilityInterval = setInterval(function(){
			AJAXCallHandler.checkGameRoomAvailabilityAJAXCall();
		}, Constants.CHECK_ROOM_AVAILABILITY_INTERVAL_DURATION);
	}

	/**
	 * Checks whether the opponent is done with their turn. 
	 */
	ns.setCheckIfOpponentIsDoneInterval = function(){
		checkIfOpponentIsDoneInterval = setInterval(function(){
			AJAXCallHandler.checkIfOpponentIsDoneAJAXCall();
		}, Constants.CHECK_IF_OPPONENT_IS_DONE_INTERVAL_DURATION);
	}

	/**
	 * Checks whether the opponent left. 
	 */
	ns.setCheckIfAPlayerLeftInterval = function(){
		checkIfAPlayerLeftInterval = setInterval(function(){
			AJAXCallHandler.checkIfAPlayerLeftAJAXCall();
		}, Constants.CHECK_IF_A_PLAYER_LEFT_INTERVAL_DURATION);
	}

	/**
	 * Clears the interval for checking 
	 * whether an opponent entered the game. 
	 */
	ns.clearCheckForOpponentInterval = function(){ 
		clearInterval(checkForOpponentInterval); 
	}

	/**
	 * Clears the interval for checking the 
	 * availability of all of the game rooms. 
	 */
	ns.clearCheckRoomAvailabilityInterval = function(){ 
		clearInterval(checkRoomAvailabilityInterval); 
	}
	
	/**
	 * Clears the interval for whether the 
	 * opponent is done with their turn. 
	 */
	ns.clearCheckIfOpponentIsDoneInterval = function(){ 
		clearInterval(checkIfOpponentIsDoneInterval); 
	}

	/**
	 * Clears the interval for whether 
	 * the opponent left the game.  
	 */
	ns.clearCheckIfAPlayerLeftInterval = function(){ 
		clearInterval(checkIfAPlayerLeftInterval); 
	}

	/**
	 * Clears all of the intervals 
	 * associated with this class. 
	 */
	ns.clearAllAJAXCallIntervals = function(){
		clearInterval(checkForOpponentInterval);
		clearInterval(checkRoomAvailabilityInterval);
		clearInterval(checkIfOpponentIsDoneInterval);
		clearInterval(checkIfAPlayerLeftInterval);
	}
}());