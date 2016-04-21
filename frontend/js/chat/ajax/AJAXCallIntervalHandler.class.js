/**
 * Some AJAX calls have to be repeated throughout the application in order to update the game 
 * accordingly, this class contains all of the functions for setting the ajax call intervals. 
 * @class
 * @author Roman Pusec
 * @namespace rpcheckers.chat.ajax
 */
rpcheckers.chat.ajax.AJAXCallIntervalHandler = {};

(function(){

	var ns = rpcheckers.chat.ajax.AJAXCallIntervalHandler
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
		AJAXCallHandler = rpcheckers.chat.ajax.AJAXCallHandler;
		Constants = rpcheckers.chat.config.Constants;
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

}());