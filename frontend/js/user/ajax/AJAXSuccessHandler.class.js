/**
 * This class contains all of the AJAX call success handler 
 * functions used in the chat and user portions of the application.  
 * @class
 * @author Roman Pusec
 * @namespace rpcheckers.user.ajax
 * @requires SharedFuncts object. 
 */
rpcheckers.user.ajax.AJAXSuccessHandler = {};

(function(){

	var	ns = rpcheckers.user.ajax.AJAXSuccessHandler
	,	Constants;

	/**
	 * Inizializes the object. 
	 * @constructor
	 */
	ns.initialize = function(){
		Constants = rpcheckers.user.config.Constants;
	}

	/**
	 * Checks if the user is logged into the application. 
	 * Deactivates the modal login window and initializes the game. 
	 * Otherwise, it activates the said modal window and uninitializes 
	 * the game. 
	 * The AJAX for this function is executed upon loading the application. 
	 * @param  {Object} data Data from the server. 
	 */
	ns.checkUserLoggedHandlerSuccess = function(data){
		if(data.isLogged)
		{
			deactivateModalLogin();
			initializeGame(data.hasOwnProperty('arrUserColor') ? data.arrUserColor : null);
		}
		else
		{
			activateModalLogin();
			uninitializeGame();
		}
	}

	/**
	 * Executed after the user attempted to login. 
	 * The login window is deactivated and the game is 
	 * initialized upon success, otherwise errors are displayed. 
	 * @param  {Object} data Data from the server. 
	 */
	ns.loginUserSuccessHandler = function(data){
		if(data.success)
		{
			deactivateModalLogin();
			initializeGame(data.hasOwnProperty('arrUserColor') ? data.arrUserColor : null);
		}
		else
		{
			BootstrapDialog.show({
				type: BootstrapDialog.TYPE_DANGER,
				title: "Error",
				message: data.hasOwnProperty('errors') ? SharedFuncts.formatLineByLine(data.errors) : 'Wrong username / password. '
			});
		}
	}

	/**
	 * Executed upon user's attempt at registration. 
	 * @param  {Object} data Data from the server. 
	 */
	ns.registerUserSuccessHandler = function(data){
		if(data.success)
		{
			var form = $('#modal-signup').find('form').eq(0);
			form.find('#firstname').val('');
			form.find('#lastname').val('');
			form.find('#username').val('');
			form.find('#password').val('');
			form.find('#passwordConfirm').val('');
			$('#modal-signup').modal('hide');

			BootstrapDialog.show({
				type: BootstrapDialog.TYPE_SUCCESS,
				title: "Registration status",
				message: 'Account successfully created. '
			});
		}
		else
		{
			BootstrapDialog.show({
				type: BootstrapDialog.TYPE_DANGER,
				title: "Registration status",
				message: SharedFuncts.formatLineByLine(data.errors)
			});
		}
	}

	/**
	 * Executed upon user's attempt at changing their account settings. 
	 * @param  {Object} data Data from the server. 
	 */
	ns.alterUserSettingsSuccessHandler = function(data){
		var message = 'Account settings successfully altered. ';

		if(data.success)
		{
			$.each($('#modal-account-settings').find('.form-control'), function(fcKey, fcVal){
				$(fcVal).val('');
				$(fcVal).attr('disabled', 'disabled');
			});

			$.each($('#modal-account-settings').find('.enable-input-change'), function(fcKey, fcVal){
				$(fcVal).text('Change?');
			});
			
			$('#modal-account-settings').modal('hide');
		}
		else
			message = SharedFuncts.formatLineByLine(data.errors);

		BootstrapDialog.show({
			type: data.success ? BootstrapDialog.TYPE_SUCCESS : BootstrapDialog.TYPE_DANGER,
			title: "Account settings status",
			message: message
		});
	}

	/**
	 * Executed upon user's attempt to logout. 
	 * @param  {Object} data Data from the server. 
	 */
	ns.logoutUserSuccessHandler = function(data){
		BootstrapDialog.show({
			type: data.success ? BootstrapDialog.TYPE_SUCCESS : BootstrapDialog.TYPE_DANGER,
			title: 'Logout status',
			message: data.message
		});

		if(data.success)
		{
			activateModalLogin();
			uninitializeGame();
		}
	}

	ns.updateUsersConnStateSuccessHandler = function(data){
		if(!data.success)
			return;

		if(parseInt(data.loggedUserConnStat) === 0){
			rpcheckers.user.ajax.AJAXCallHandler.checkLoginStatusAJAXCall();
		}
	}

}());