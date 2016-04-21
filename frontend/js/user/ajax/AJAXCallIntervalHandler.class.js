/**
 * Some AJAX calls have to be repeated throughout the application in order to update the game 
 * accordingly, this class contains all of the functions for setting the ajax call intervals. 
 * @class
 * @author Roman Pusec
 * @namespace rpcheckers.user.ajax
 */
rpcheckers.user.ajax.AJAXCallIntervalHandler = {};

(function(){

	var ns = rpcheckers.user.ajax.AJAXCallIntervalHandler
	,	AJAXCallHandler
	,	Constants;

	var	checkForNewMessagesInterval
	,	checkWhoIsOnlineInterval
	,	updateConnTimeInterval
	,	updateUsersConnStateInterval;

	/**
	 * Initializes the object. 
	 * @constructor
	 */
	ns.initialize = function(){
		AJAXCallHandler = rpcheckers.user.ajax.AJAXCallHandler;
		Constants = rpcheckers.user.config.Constants;
	}

	/**
	 * Updates the connection exparation date of the user. 
	 */
	ns.setUpdateConnTimeInterval = function(){
		updateConnTimeInterval = setInterval(function(){
			AJAXCallHandler.updateConnTimeAJAXCall();
		}, Constants.UPDATE_CONN_TIME_DELAY);
	}

	/**
	 * Updates the user's connection state (whether the user should be 
	 * marked as connected or disconnected). 
	 */
	ns.setUpdateUsersConnStateInterval = function(){
		updateUsersConnStateInterval = setInterval(function(){
			AJAXCallHandler.updateUsersConnStateAJAXCall();
		}, Constants.UPDATE_USERS_CONN_STATE);
	}

	/**
	 * Clears the intreval for updating connection exparation date. 
	 */
	ns.clearUpdateConnTimeInterval = function(){
		clearInterval(updateConnTimeInterval);
	}

	/**
	 * Clears the interval for updating the user's connection state. 
	 */
	ns.clearUpdateUsersConnStateInterval = function(){
		clearInterval(updateUsersConnStateInterval);
	}

}());