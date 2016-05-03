/**
 * Contains all of the AJAX call functions used 
 * in the game portion of the application. 
 * @class
 * @author Roman Pusec
 * @namespace rpcheckers.user.ajax
 * @requires SharedFuncts object. 
 */
rpcheckers.user.ajax.AJAXCallHandler = {};

(function(){

	var	ns = rpcheckers.user.ajax.AJAXCallHandler
	,	AJAXSuccessHandler;

	/**
	 * Initializes the object. 
	 * @constructor
	 */
	ns.initialize = function(){
		AJAXSuccessHandler = rpcheckers.user.ajax.AJAXSuccessHandler
	}

	/**
	 * Checks whether the user is logged in or not. 
	 */
	ns.checkLoginStatusAJAXCall = function(){
		SharedFuncts.runAjax({
			url:'backend/view/UsersView.php',
			data:'path=is-user-logged',
			success: AJAXSuccessHandler.checkUserLoggedHandlerSuccess
		});
	}

	/**
	 * Updates the connection exparation date of the authenticated user. 
	 */
	ns.updateConnTimeAJAXCall = function(){
		SharedFuncts.runAjax({
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
		SharedFuncts.runAjax({
			url:'backend/view/UsersView.php',
			data:'path=update-users-conn-stat',
			success: AJAXSuccessHandler.updateUsersConnStateSuccessHandler
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
		SharedFuncts.runAjax({
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
		SharedFuncts.runAjax({
			type: 'post',
			url:'backend/view/UsersView.php',
			data: formData,
			success: AJAXSuccessHandler.registerUserSuccessHandler
		});
	}

	/**
	 * Alters user's account settings. 
	 * @param  {FormData} formData Should contain the following: 
	 *                           - firstname => The first name of the user. 
	 *                           - lastname => The last name of the user. 
	 *                           - username => The username. 
	 *                           - password => User's password. 
	 *                           - passwordConfirm => Confirmation of the user's password. 
	 */
	ns.alterUserSettingsAJAXCall = function(formData){
		SharedFuncts.runAjax({
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
		SharedFuncts.runAjax({
			url:'backend/view/UsersView.php',
			data:'path=log-user-out',
			success: AJAXSuccessHandler.logoutUserSuccessHandler
		});
	}

}());