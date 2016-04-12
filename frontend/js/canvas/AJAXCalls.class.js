var AJAXCalls = {};

(function(){

	/**
	 * AJAX call which, when successfully executed, will escort the player to
	 * a game room of player's choice. 
	 */
	AJAXCalls.toGameRoomAJAXCall = function(targetRoomID){
		runAjax({
			url: Constants.ROOM_VIEW_URI,
			data:'path=add-to-game-room&gameRoomID=' + targetRoomID,
			success: AJAXSuccessHandlers.toGameRoomSuccessHandler
		});
	}

	/**
	 * AJAX call which, when successfully executed, will return the player
	 * back to the list of game rooms. 
	 */
	AJAXCalls.offGameRoomAJAXCall = function(){
		runAjax({
			url: Constants.ROOM_VIEW_URI,
			data: 'path=remove-from-game-room',
			success: AJAXSuccessHandlers.offGameSuccessHandler
		});
	}

	/**
	 * AJAX call which checks if a game room is available
	 * (that is, if the maximum amount of players has not
	 * been reached). 
	 */
	AJAXCalls.checkGameRoomAvailabilityAJAXCall = function(){
		runAjax({
			url: Constants.ROOM_VIEW_URI,
			data: 'path=check-room-availability',
			success: AJAXSuccessHandlers.checkGameRoomAvailabilitySuccessHandler
		});
	}

	/**
	 * AJAX call which displays all game 
	 * rooms from the database.  
	 */
	AJAXCalls.displayAllRoomsAJAXCall = function(){
		runAjax({
			url: Constants.ROOM_VIEW_URI,
			data: 'path=get-all-rooms',
			success: AJAXSuccessHandlers.displayAllRoomsSuccessHandler
		});
	}

	/**
	 * AJAX call which checks if a player's 
	 * opponent entered the game.  
	 */
	AJAXCalls.checkForOpponentAJAXCall = function(){
		runAjax({
			url: Constants.ROOM_VIEW_URI,
			data: 'path=check-for-opponent',
			success: AJAXSuccessHandlers.checkForOpponentSuccessHandler
		});
	}

	/**
	 * AJAX Call which checks who's turn it is in the game. 
	 * @param  {Integer} targetRoomID The room in which the two players are. 
	 */
	AJAXCalls.whoseTurnAJAXCall = function(targetRoomID){
		runAjax({
			url: Constants.GAME_VIEW_URI,
			data: 'path=check-whose-turn&gameRoomID=' + targetRoomID,
			success: AJAXSuccessHandlers.checkWhoseTurnSuccessHandler
		});
	}

	/**
	 * AJAX Call which evaluates the move the player made (that is, if 
	 * the move was valid and obeys the rules of the game). 
	 * @param  {Number} prevX             The initial X coordinate of the selected pawn. 
	 * @param  {Number} prevY             The initial Y coordinate of the selected pawn. 
	 * @param  {Number} newX              The new X coordinate of the selected pawn. 
	 * @param  {Number} newY              The new X coordinate of the selected pawn.  
	 */
	AJAXCalls.evaluatePlayerMoveAJAXCall = function(prevX, prevY, newX, newY){
		runAjax({
			url: Constants.GAME_VIEW_URI,
			data: 'path=evaluate-player-move&prevX=' + prevX + '&prevY=' + prevY + '&newX=' + newX + '&newY=' + newY,
			success: AJAXSuccessHandlers.evaluatePlayerMoveSuccessHandler
		});
	}

	/**
	 * AJAX Call which checks if the player's 
	 * opponent made their move. 
	 */
	AJAXCalls.checkIfOpponentIsDoneAJAXCall = function(){
		runAjax({
			url: Constants.GAME_VIEW_URI,
			data: 'path=check-if-opponent-is-done',
			success: AJAXSuccessHandlers.checkIfOpponentIsDoneSuccessHandler
		});
	}

	/**
	 * Checks whether the opponent left the game. 
	 */
	AJAXCalls.checkIfAPlayerLeftAJAXCall = function(){
		runAjax({
			url: Constants.GAME_VIEW_URI,
			data: 'path=check-if-a-player-left',
			success: AJAXSuccessHandlers.checkIfAPlayerLeftSuccessHandler
		});
	}

	/**
	 * It is executed when the timer ran out, thus the 
	 * turn should be switched. 
	 */
	AJAXCalls.notifyTimeOutAJAXCall = function(){
		runAjax({
			url: Constants.GAME_VIEW_URI,
			data: 'path=notify-turn-time-out',
			success: AJAXSuccessHandlers.notifyTimeOutSuccessHandler
		});
	}

	/**
	 * Runs an AJAX call. Includes default properties that are shared among
	 * all AJAX requests. 
	 * @param  {Object} options Represents parameters. 
	 * @see jQuery AJAX documentation for param clarifications. 
	 */
	function runAjax(options){
		$.ajax($.extend({
			type: 'get',
			processData: false,
			contentType: false,
			dataType: 'json',
			error: function(data){console.log(data);}
		}, options));
	}

}());