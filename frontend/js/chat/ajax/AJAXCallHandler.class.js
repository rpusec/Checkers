/**
 * Contains all of the AJAX call functions used 
 * in the game portion of the application. 
 * @class
 * @author Roman Pusec
 * @namespace rpcheckers.chat.ajax
 * @requires SharedFuncts object. 
 */
rpcheckers.chat.ajax.AJAXCallHandler = {};

(function(){

	var	ns = rpcheckers.chat.ajax.AJAXCallHandler
	,	AJAXSuccessHandler;

	/**
	 * Initializes the object. 
	 * @constructor
	 */
	ns.initialize = function(){
		AJAXSuccessHandler = rpcheckers.chat.ajax.AJAXSuccessHandler
	}

	/**
	 * Checks for new messages. 
	 */
	ns.checkForNewMessagesAJAXCall = function(){
		SharedFuncts.runAjax({
			url:'backend/view/ChatView.php',
			data:'path=get-message',
			success: AJAXSuccessHandler.checkForNewMessagesSuccessHandler
		});
	}

	/**
	 * Sends a message to the server. 
	 * @param  {FormData} formData Should contain the following:
	 *                             - message => The message to be displayed. 
	 */
	ns.sendMessageAJAXCall = function(formData){
		formData.append('path', 'send-message');
		SharedFuncts.runAjax({
			type: 'post',
			url: 'backend/view/ChatView.php',
			data: formData,
			success: AJAXSuccessHandler.sendMessageSuccessHandler
		});
	}

	/**
	 * Checks who is online. 
	 */
	ns.checkWhoIsOnlineAJAXCall = function(){
		SharedFuncts.runAjax({
			url:'backend/view/UsersView.php',
			data:'path=who-is-online',
			success: AJAXSuccessHandler.checkWhoIsOnlineSuccessHandler
		});
	}

}());