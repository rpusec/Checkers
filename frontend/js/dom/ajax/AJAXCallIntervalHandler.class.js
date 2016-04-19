/**
 * Some AJAX calls have to be repeated throughout the application in order to update the game 
 * accordingly, this class contains all of the functions for setting the ajax call intervals. 
 * @class
 * @author Roman Pusec
 * @namespace rpcheckers.dom.ajax
 */
rpcheckers.dom.ajax.AJAXCallIntervalHandler = {};

(function(){

	var ns = rpcheckers.dom.ajax.AJAXCallIntervalHandler
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
		AJAXCallHandler = rpcheckers.dom.ajax.AJAXCallHandler;
		Constants = rpcheckers.dom.config.Constants;
	}

	/**
	 * Checks for a new message. 
	 */
	ns.setCheckForNewMessagesInterval = function(){
		checkForNewMessagesInterval = setInterval(function(){
			AJAXCallHandler.checkForNewMessagesAJAXCall();
		}, Constants.CHECK_FOR_NEW_MESSAGES_DELAY);
	}

	/**
	 * Checks who is online in the application. 
	 */
	ns.setCheckWhoIsOnlineInterval = function(){
		checkWhoIsOnlineInterval = setInterval(function(){
			AJAXCallHandler.checkWhoIsOnlineAJAXCall();
		}, Constants.CHECK_WHO_IS_ONLINE_DELAY);
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
	 * Clears the interval for new messages. 
	 */
	ns.clearCheckForNewMessagesInterval = function(){
		clearInterval(checkForNewMessagesInterval);
	}

	/**
	 * Clears the interval for checking who's online. 
	 */
	ns.clearCheckWhoIsOnlineInterval = function(){
		clearInterval(checkWhoIsOnlineInterval);	
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