var AJAXCallIntervalHandlers = {};

(function(){

	var	checkForOpponentInterval
	,	checkRoomAvailabilityInterval
	,	checkIfOpponentIsDoneInterval
	,	checkIfAPlayerLeftInterval;

	AJAXCallIntervalHandlers.setCheckForOpponentInterval = function(){
		checkForOpponentInterval = setInterval(function(){
			AJAXCalls.checkForOpponentAJAXCall();
		}, Constants.CHECK_OPPONENT_INTERVAL_DURATION);
	}

	AJAXCallIntervalHandlers.setCheckRoomAvailabilityInterval = function(){
		checkRoomAvailabilityInterval = setInterval(function(){
			AJAXCalls.checkGameRoomAvailabilityAJAXCall();
		}, Constants.CHECK_ROOM_AVAILABILITY_INTERVAL_DURATION);
	}

	AJAXCallIntervalHandlers.setCheckIfOpponentIsDoneInterval = function(){
		checkIfOpponentIsDoneInterval = setInterval(function(){
			AJAXCalls.checkIfOpponentIsDoneAJAXCall();
		}, Constants.CHECK_IF_OPPONENT_IS_DONE_INTERVAL_DURATION);
	}

	AJAXCallIntervalHandlers.setCheckIfAPlayerLeftInterval = function(){
		checkIfAPlayerLeftInterval = setInterval(function(){
			AJAXCalls.checkIfAPlayerLeftAJAXCall();
		}, Constants.CHECK_IF_A_PLAYER_LEFT_INTERVAL_DURATION);
	}

	AJAXCallIntervalHandlers.clearCheckForOpponentInterval = function(){ 
		clearInterval(checkForOpponentInterval); 
	}

	AJAXCallIntervalHandlers.clearCheckRoomAvailabilityInterval = function(){ 
		clearInterval(checkRoomAvailabilityInterval); 
	}
	
	AJAXCallIntervalHandlers.clearCheckIfOpponentIsDoneInterval = function(){ 
		clearInterval(checkIfOpponentIsDoneInterval); 
	}

	AJAXCallIntervalHandlers.clearCheckIfAPlayerLeftInterval = function(){ 
		clearInterval(checkIfAPlayerLeftInterval); 
	}

	AJAXCallIntervalHandlers.clearAllAJAXCallIntervals = function(){
		clearInterval(checkForOpponentInterval);
		clearInterval(checkRoomAvailabilityInterval);
		clearInterval(checkIfOpponentIsDoneInterval);
		clearInterval(checkIfAPlayerLeftInterval);
	}

}());