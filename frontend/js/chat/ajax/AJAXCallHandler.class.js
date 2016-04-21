/**
 * Contains all of the AJAX call functions used 
 * in the game portion of the application. 
 * @class
 * @author Roman Pusec
 * @namespace rpcheckers.chat.ajax
 */
rpcheckers.dom.ajax.AJAXCallHandler = {};

(function(){

	var	ns = rpcheckers.dom.ajax.AJAXCallHandler
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
		runAjax({
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
		runAjax({
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
		runAjax({
			url:'backend/view/UsersView.php',
			data:'path=who-is-online',
			success: AJAXSuccessHandler.checkWhoIsOnlineSuccessHandler
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