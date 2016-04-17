/**
 * Contains all of the AJAX call functions used 
 * in the game portion of the application. 
 * @class
 * @author Roman Pusec
 * @namespace rpcheckers.game.ajax
 */
rpcheckers.game.ajax.AJAXCallHandler = {};

(function(){

	var	ns = rpcheckers.game.ajax.AJAXCallHandler
	,	AJAXSuccessHandler;

	ns.initialize = function(){
		AJAXSuccessHandler = rpcheckers.game.ajax.AJAXSuccessHandler
	}

	/**
	 * AJAX call which, when successfully executed, will escort the player to
	 * a game room of player's choice. 
	 */
	ns.toGameRoomAJAXCall = function(targetRoomID){
		runAjax({
			url: Constants.ROOM_VIEW_URI,
			data: Constants.BACKEND_FUNC_CALL_PARAM + '=add-to-game-room&gameRoomID=' + targetRoomID,
			success: AJAXSuccessHandler.toGameRoomSuccessHandler
		});
	}

	/**
	 * AJAX call which, when successfully executed, will return the player
	 * back to the list of game rooms. 
	 */
	ns.offGameRoomAJAXCall = function(){
		runAjax({
			url: Constants.ROOM_VIEW_URI,
			data: Constants.BACKEND_FUNC_CALL_PARAM + '=remove-from-game-room',
			success: AJAXSuccessHandler.offGameSuccessHandler
		});
	}

	/**
	 * AJAX call which checks if a game room is available
	 * (that is, if the maximum amount of players has not
	 * been reached). 
	 */
	ns.checkGameRoomAvailabilityAJAXCall = function(){
		runAjax({
			url: Constants.ROOM_VIEW_URI,
			data: Constants.BACKEND_FUNC_CALL_PARAM + '=check-room-availability',
			success: AJAXSuccessHandler.checkGameRoomAvailabilitySuccessHandler
		});
	}

	/**
	 * AJAX call which displays all game 
	 * rooms from the database.  
	 */
	ns.displayAllRoomsAJAXCall = function(){
		runAjax({
			url: Constants.ROOM_VIEW_URI,
			data: Constants.BACKEND_FUNC_CALL_PARAM + '=get-all-rooms',
			success: AJAXSuccessHandler.displayAllRoomsSuccessHandler
		});
	}

	/**
	 * AJAX call which checks if a player's 
	 * opponent entered the game.  
	 */
	ns.checkForOpponentAJAXCall = function(){
		runAjax({
			url: Constants.ROOM_VIEW_URI,
			data: Constants.BACKEND_FUNC_CALL_PARAM + '=check-for-opponent',
			success: AJAXSuccessHandler.checkForOpponentSuccessHandler
		});
	}

	/**
	 * AJAX Call which checks who's turn it is in the game. 
	 * @param  {Integer} targetRoomID The room in which the two players are. 
	 */
	ns.whoseTurnAJAXCall = function(targetRoomID){
		runAjax({
			url: Constants.GAME_VIEW_URI,
			data: Constants.BACKEND_FUNC_CALL_PARAM + '=check-whose-turn&gameRoomID=' + targetRoomID,
			success: AJAXSuccessHandler.checkWhoseTurnSuccessHandler
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
	ns.evaluatePlayerMoveAJAXCall = function(prevX, prevY, newX, newY){
		runAjax({
			url: Constants.GAME_VIEW_URI,
			data: Constants.BACKEND_FUNC_CALL_PARAM + '=evaluate-player-move&prevX=' + prevX + '&prevY=' + prevY + '&newX=' + newX + '&newY=' + newY,
			success: AJAXSuccessHandler.evaluatePlayerMoveSuccessHandler
		});
	}

	/**
	 * AJAX Call which checks if the player's 
	 * opponent made their move. 
	 */
	ns.checkIfOpponentIsDoneAJAXCall = function(){
		runAjax({
			url: Constants.GAME_VIEW_URI,
			data: Constants.BACKEND_FUNC_CALL_PARAM + '=check-if-opponent-is-done',
			success: AJAXSuccessHandler.checkIfOpponentIsDoneSuccessHandler
		});
	}

	/**
	 * Checks whether the opponent left the game. 
	 */
	ns.checkIfAPlayerLeftAJAXCall = function(){
		runAjax({
			url: Constants.GAME_VIEW_URI,
			data: Constants.BACKEND_FUNC_CALL_PARAM + '=check-if-a-player-left',
			success: AJAXSuccessHandler.checkIfAPlayerLeftSuccessHandler
		});
	}

	/**
	 * It is executed when the timer ran out, thus the 
	 * turn should be switched. 
	 */
	ns.notifyTimeOutAJAXCall = function(){
		runAjax({
			url: Constants.GAME_VIEW_URI,
			data: Constants.BACKEND_FUNC_CALL_PARAM + '=notify-turn-time-out',
			success: AJAXSuccessHandler.notifyTimeOutSuccessHandler
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