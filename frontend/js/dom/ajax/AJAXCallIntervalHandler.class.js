rpcheckers.dom.ajax.AJAXCallIntervalHandler = {};

(function(){

	var ns = rpcheckers.dom.ajax.AJAXCallIntervalHandler
	,	AJAXCallHandler
	,	Constants;

	var	checkForNewMessagesInterval
	,	checkWhoIsOnlineInterval
	,	updateConnTimeInterval
	,	updateUsersConnStateInterval;

	ns.initialize = function(){
		AJAXCallHandler = rpcheckers.dom.ajax.AJAXCallHandler;
		Constants = rpcheckers.dom.config.Constants;
	}

	ns.setCheckForNewMessagesInterval = function(){
		checkForNewMessagesInterval = setInterval(function(){
			AJAXCallHandler.checkForNewMessagesAJAXCall();
		}, Constants.CHECK_FOR_NEW_MESSAGES_DELAY);
	}

	ns.setCheckWhoIsOnlineInterval = function(){
		checkWhoIsOnlineInterval = setInterval(function(){
			AJAXCallHandler.checkWhoIsOnlineAJAXCall();
		}, Constants.CHECK_WHO_IS_ONLINE_DELAY);
	}

	ns.setUpdateConnTimeInterval = function(){
		updateConnTimeInterval = setInterval(function(){
			AJAXCallHandler.updateConnTimeAJAXCall();
		}, Constants.UPDATE_CONN_TIME_DELAY);
	}

	ns.setUpdateUsersConnStateInterval = function(){
		updateUsersConnStateInterval = setInterval(function(){
			AJAXCallHandler.updateUsersConnStateAJAXCall();
		}, Constants.UPDATE_USERS_CONN_STATE);
	}

	ns.clearCheckForNewMessagesInterval = function(){
		clearInterval(checkForNewMessagesInterval);
	}

	ns.clearCheckWhoIsOnlineInterval = function(){
		clearInterval(checkWhoIsOnlineInterval);	
	}

	ns.clearUpdateConnTimeInterval = function(){
		clearInterval(updateConnTimeInterval);
	}

	ns.clearUpdateUsersConnStateInterval = function(){
		clearInterval(updateUsersConnStateInterval);
	}

}());