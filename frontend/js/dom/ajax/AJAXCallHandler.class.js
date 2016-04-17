rpcheckers.dom.ajax.AJAXCallHandler = {};

(function(){

	var	ns = rpcheckers.dom.ajax.AJAXCallHandler
	,	AJAXSuccessHandler;

	ns.initialize = function(){
		AJAXSuccessHandler = rpcheckers.dom.ajax.AJAXSuccessHandler
	}

	ns.checkLoginStatusAJAXCall = function(){
		runAjax({
			url:'backend/view/UsersView.php',
			data:'path=is-user-logged',
			success: AJAXSuccessHandler.checkUserLoggedHandlerSuccess
		});
	}

	ns.checkForNewMessagesAJAXCall = function(){
		runAjax({
			url:'backend/view/ChatView.php',
			data:'path=get-message',
			success: AJAXSuccessHandler.checkForNewMessagesSuccessHandler
		});
	}

	ns.checkWhoIsOnlineAJAXCall = function(){
		runAjax({
			url:'backend/view/ChatView.php',
			data:'path=who-is-online',
			success: AJAXSuccessHandler.checkWhoIsOnlineSuccessHandler
		});
	}

	ns.updateConnTimeAJAXCall = function(){
		runAjax({
			url:'backend/view/UsersView.php',
			data:'path=update-conn-time',
			success: AJAXSuccessHandler.updateConnTimeSuccessHandler
		});
	}

	ns.updateUsersConnStateAJAXCall = function(){
		runAjax({
			url:'backend/view/UsersView.php',
			data:'path=update-users-conn-stat',
			success: AJAXSuccessHandler.updateUsersConnStateSuccessHandler
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