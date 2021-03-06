$(document).on('ready', function(){
	var AJAXCallHandler = rpcheckers.user.ajax.AJAXCallHandler;
	var AJAXCallIntervalHandler = rpcheckers.user.ajax.AJAXCallIntervalHandler;
	AJAXCallHandler.initialize();
	AJAXCallIntervalHandler.initialize();

	//when the user clicks on the 'create account' option, then the modal signup is displayed
	$('#sign-up-btn').on('click', function(){
		$('#modal-signup').modal('show');
	});

	//displays the modal login window if the modal signup window is closed 
	$('#modal-signup').on('hidden.bs.modal', function(){
		$('#modal-login').modal('show');
	});

	//displays the modal account settings window if the profile option link was clicked
	$('#profile-option-link').on('click', function(){
		$('#modal-account-settings').modal('show');
	});

	/**
	 * Activates the modal window for user login. 
	 * If the login modal window is closed (e.g. if user presses somewhere
	 * outside of the modal window) then the modal window reapears again.   
	 */
	window.activateModalLogin = function(){
		$('#modal-login').modal('show');
		$('#modal-login').on('hidden.bs.modal', function(e){

			//login modal is only displayed when the signup modal window is closed 
			if(!$('#modal-signup').is(':visible'))
				$('#modal-login').modal('show');
		});

		//removes all of the chat bubbles in the chat window
		$.each($('#chat-window').children(), function(childKey, childVal){
			$(childVal).toggleBubbleOff();
		});
	}

	/**
	 * Hides the modal login window and deactivates 
	 * the modal hide listener. 
	 */
	window.deactivateModalLogin = function(){
		$('#modal-login').off('hidden.bs.modal');
		$('#modal-login').modal('hide');
	}
	
	$('#modal-login').find('input[name=username]').on('keypress', loginUserKeyHandler);
	$('#modal-login').find('input[name=password]').on('keypress', loginUserKeyHandler);
	$('#modal-login').find('button[name="submit-btn"]').on('click', loginUser);

	/**
	 * Handles key events on the login form. 
	 */
	function loginUserKeyHandler(e){
		var key = e.which || e.keyCode;
		
		if(key === 13)
			loginUser();
	}

	/**
	 * Logs the user inside of the application. 
	 */
	function loginUser(){
		var form = $('#modal-login').find('form').eq(0);
		var username = form.find('#username').val();
		var password = form.find('#password').val();

		var formData = new FormData();
		formData.append('username', username);
		formData.append('password', password);

		$('#modal-login').find('form').find('#username').val('');
		$('#modal-login').find('form').find('#password').val('');

		AJAXCallHandler.loginUserAJAXCall(formData);
	}

	//fetches the signup modal window's submit button, handles registration process
	$('#modal-signup').find('button[name="submit-btn"]').on('click', function(){

		var form = $('#modal-signup').find('form').eq(0);
		var firstname = form.find('#firstname').val();
		var lastname = form.find('#lastname').val();
		var username = form.find('#username').val();
		var password = form.find('#password').val();
		var passwordConfirm = form.find('#passwordConfirm').val();

		var formData = new FormData();
		formData.append('firstname', firstname);
		formData.append('lastname', lastname);
		formData.append('username', username);
		formData.append('password', password);
		formData.append('passwordConfirm', passwordConfirm);

		AJAXCallHandler.registerUserAJAXCall(formData);
	});

	//account settings modal btns
	$('button[name=should-ch-fname-btn]').on('click', enableInputHandler);
	$('button[name=should-ch-lname-btn]').on('click', enableInputHandler);
	$('button[name=should-ch-username-btn]').on('click', enableInputHandler);
	$('button[name=should-ch-password-btn]').on('click', enablePasswordHandler);

	$('#modal-account-settings').find('input[name=lastname]').on('keyup', modalASIKeyPressHandler);
	$('#modal-account-settings').find('input[name=firstname]').on('keyup', modalASIKeyPressHandler);
	$('#modal-account-settings').find('input[name=username]').on('keyup', modalASIKeyPressHandler);
	$('#modal-account-settings').find('input[name=password]').on('keyup', modalASIKeyPressHandler);
	$('#modal-account-settings').find('input[name=passwordConfirm]').on('keyup', modalASIKeyPressHandler);

	$('#modal-account-settings').find('button[name=submit-btn]').attr('disabled', 'disabled');

	/**
	 * Executed when the user presses the "Change?/Exclude?" buttons 
	 * on the Account Settings modal window. 
	 */
	function enableInputHandler(){
		enableInput(this);
		modalASIKeyPressHandler();
	}

	/**
	 * Checks if there's at least one input field that has a value to determine
	 * whether to disable or enable the submission button. 
	 * ASI stands for Account Settings Input. 
	 */
	function modalASIKeyPressHandler(){
		var shouldEnable = true;

		if($('#modal-account-settings').find('input.form-control:enabled').length === 0)
			shouldEnable = false;
		else
		{
			$.each($('#modal-account-settings').find('input.form-control:enabled'), function(fcKey, fcVal){
				if($(fcVal).val() === '')
				{
					shouldEnable = false;
					return false;
				}
			});
		}

		if(shouldEnable)
			$('#modal-account-settings').find('button[name=submit-btn]').removeAttr('disabled');
		else
			$('#modal-account-settings').find('button[name=submit-btn]').attr('disabled', 'disabled');
	}

	/**
	 * Enables an input from the account settings modal window. 
	 * @return {boolean} True if the input field has been disabled, false otherwise. 
	 */
	function enableInput(thisVar){
		if(typeof thisVar === 'undefined')
			thisVar = this;

		if(typeof $(thisVar).parent().parent().find('input').attr('disabled') !== 'undefined')
		{
			$(thisVar).parent().parent().find('input').removeAttr('disabled');
			$(thisVar).text('Exclude?');
			return true;
		}

		$(thisVar).parent().parent().find('input').attr('disabled', 'disabled');
		$(thisVar).parent().parent().find('input').val('');
		$(thisVar).text('Change?');
                
		return false;
	}

	/**
	 * This is a special case since we should enable not only the password field itself but also
	 * the passwordConfirm field. It embodies the enableInput() function. 
	 */
	function enablePasswordHandler(){
		if(enableInput(this))
			$('input[name=passwordConfirm]').removeAttr('disabled');
		else
		{
			$('input[name=passwordConfirm]').attr('disabled', 'disabled');
			$('input[name=passwordConfirm]').val('');
		}

		modalASIKeyPressHandler();
	}

	//when the submit button was pressed on the Account Settings section 
	$('#modal-account-settings').find('button[name=submit-btn]').on('click', function(){

		var form = $('#modal-account-settings').find('form').eq(0);
		var firstname = form.find('#firstname').val();
		var lastname = form.find('#lastname').val();
		var username = form.find('#username').val();
		var password = form.find('#password').val();
		var passwordConfirm = form.find('#passwordConfirm').val();

		var formData = new FormData();
		formData.append('firstname', firstname);
		formData.append('lastname', lastname);
		formData.append('username', username);
		formData.append('password', password);
		formData.append('passwordConfirm', passwordConfirm);
		formData.append('path', 'register-user');

		AJAXCallHandler.alterUserSettingsAJAXCall(formData);
	});

	//when the logout option was used 
	$('#logout-option-link').on('click', function(){
		AJAXCallHandler.logoutUserAJAXCall();
	});

	AJAXCallIntervalHandler.setUpdateConnTimeInterval();
	AJAXCallIntervalHandler.setUpdateUsersConnStateInterval();
});