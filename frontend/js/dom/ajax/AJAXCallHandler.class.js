/**
 * Contains all of the AJAX call functions used 
 * in the game portion of the application. 
 * @class
 * @author Roman Pusec
 * @namespace rpcheckers.dom.ajax
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
		AJAXSuccessHandler = rpcheckers.dom.ajax.AJAXSuccessHandler
	}

	/**
	 * Checks whether the user is logged in or not. 
	 */
	ns.checkLoginStatusAJAXCall = function(){
		runAjax({
			url:'backend/view/UsersView.php',
			data:'path=is-user-logged',
			success: AJAXSuccessHandler.checkUserLoggedHandlerSuccess
		});
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
	 * Updates the connection exparation date of the authenticated user. 
	 */
	ns.updateConnTimeAJAXCall = function(){
		runAjax({
			url:'backend/view/UsersView.php',
			data:'path=update-conn-time',
			success: AJAXSuccessHandler.updateConnTimeSuccessHandler
		});
	}

	/**
	 * Update the connection state (whether the user should be marked as 
	 * connected or disconnected) of the authenticated user. 
	 */
	ns.updateUsersConnStateAJAXCall = function(){
		runAjax({
			url:'backend/view/UsersView.php',
			data:'path=update-users-conn-stat',
			success: AJAXSuccessHandler.updateUsersConnStateSuccessHandler
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
	 * Authenticates the user to the applicaiton. 
	 * @param  {FormData} formData Should contain the following:
	 *                             - username => The user's username. 
	 *                             - password => The user's password. 
	 */
	ns.loginUserAJAXCall = function(formData){
		formData.append('path', 'login-user');
		runAjax({
			type: 'post',
			url:'backend/view/UsersView.php',
			data: formData,
			success: AJAXSuccessHandler.loginUserSuccessHandler
		});
	}

	/**
	 * Registers the user to the application. 
	 * @param  {FormData} formData Should contain the following: 
	 *                           - firstname => The first name of the user. 
	 *                           - lastname => The last name of the user. 
	 *                           - username => The username. 
	 *                           - password => User's password. 
	 *                           - passwordConfirm => Confirmation of the user's password. 
	 */
	ns.registerUserAJAXCall = function(formData){
		formData.append('path', 'register-user');
		runAjax({
			type: 'post',
			url:'backend/view/UsersView.php',
			data: formData,
			success: AJAXSuccessHandler.registerUserSuccessHandler
		});
	}

	/**
	 * Alters user's account settings. 
	 * @param  {[type]} formData Should contain the following: 
	 *                           - firstname => The first name of the user. 
	 *                           - lastname => The last name of the user. 
	 *                           - username => The username. 
	 *                           - password => User's password. 
	 *                           - passwordConfirm => Confirmation of the user's password. 
	 */
	ns.alterUserSettingsAJAXCall = function(formData){
		runAjax({
			type: 'post',
			url:'backend/view/UsersView.php',
			data: formData,
			success: AJAXSuccessHandler.alterUserSettingsSuccessHandler
		});
	}

	/**
	 * Logs the user out of the application. 
	 */
	ns.logoutUserAJAXCall = function(){
		runAjax({
			url:'backend/view/UsersView.php',
			data:'path=log-user-out',
			success: AJAXSuccessHandler.logoutUserSuccessHandler
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