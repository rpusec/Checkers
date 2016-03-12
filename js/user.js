$(document).on('ready', function(){
	$('#modal-login').find('input[name=username]').on('keypress', luKeyHandler);
	$('#modal-login').find('input[name=password]').on('keypress', luKeyHandler);
	$('#modal-login').find('button[name="submit-btn"]').on('click', loginUser);

	function luKeyHandler(e){
		var key = e.which || e.keyCode;
		
		if(key !== 13)
			return;

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
		formData.append('path', 'login-user');

		$('#modal-login').find('form').find('#username').val('');
		$('#modal-login').find('form').find('#password').val('');

		$.ajax({
			type:'post',
			processData: false,
			contentType: false,
			url:'backend/view/UsersView.php',
			dataType: 'json',
			data:formData,
			success:function(data){
				if(data.success){
					deactivateModalLogin();
				}
				else
				{
					var errorMessage = 'Wrong username / password. ';

					if(data.hasOwnProperty('errors'))
					{
						var errors = data.errors;
						var errorsStr = '';

						errors.forEach(function(error){
							errorsStr += error + '<br />';
						});

						errorMessage = errorsStr;
					}

					BootstrapDialog.show({
						type: BootstrapDialog.TYPE_DANGER,
						title: "Error",
						message: errorMessage
					});
				}
			},
			error:function(data){
				console.log(data);
			}
		});
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
		formData.append('path', 'register-user');

		$.ajax({
			type:'post',
			processData: false,
			contentType: false,
			url:'backend/view/UsersView.php',
			dataType: 'json',
			data:formData,
			success:function(data){
				if(data.success)
				{
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
					var errors = data.errors;
					var errorsStr = '';

					errors.forEach(function(error){
						errorsStr += error + '<br />';
					});

					BootstrapDialog.show({
						type: BootstrapDialog.TYPE_DANGER,
						title: "Registration status",
						message: errorsStr
					});
				}
			},
			error:function(data){
				console.log(data);
			}
		});
	});

	//account settings modal btns
	$('button[name=should-ch-fname-btn]').on('click', enableInputHandler);
	$('button[name=should-ch-lname-btn]').on('click', enableInputHandler);
	$('button[name=should-ch-username-btn]').on('click', enableInputHandler);
	$('button[name=should-ch-password-btn]').on('click', enablePassword);

	$('#modal-account-settings').find('input[name=lastname]').on('keyup', modalASIKeyPressHandler);
	$('#modal-account-settings').find('input[name=firstname]').on('keyup', modalASIKeyPressHandler);
	$('#modal-account-settings').find('input[name=username]').on('keyup', modalASIKeyPressHandler);
	$('#modal-account-settings').find('input[name=password]').on('keyup', modalASIKeyPressHandler);
	$('#modal-account-settings').find('input[name=passwordConfirm]').on('keyup', modalASIKeyPressHandler);

	$('#modal-account-settings').find('button[name=submit-btn]').attr('disabled', 'disabled');

	function enableInputHandler(){
		enableInput(this);
	}

	/**
	 * Checks if there's at least one input field that has a value to determine
	 * whether to disable or enable the submission button. 
	 */
	function modalASIKeyPressHandler(){
		var shouldEnable = false;

		$.each($('#modal-account-settings').find('.form-control'), function(fcKey, fcVal){
			if($(fcVal).val() !== '')
			{
				shouldEnable = true;
				return false;
			}
		});

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

	function enablePassword(){
		if(enableInput(this))
			$('input[name=passwordConfirm]').removeAttr('disabled');
		else
		{
			$('input[name=passwordConfirm]').attr('disabled', 'disabled');
			$('input[name=passwordConfirm]').val('');
		}
	}

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

		$.each($('#modal-account-settings').find('.form-control'), function(fcKey, fcVal){
			$(fcVal).val('');
			$(fcVal).attr('disabled', 'disabled');
		});
		
		$.ajax({
			type: 'post',
			processData: false,
			contentType: false,
			url:'backend/view/UsersView.php',
			dataType: 'json',
			data:formData,
			success: accountSettingsAlteredHandler,
			error:function(data){
				console.log(data);
			}
		});
	});

	function accountSettingsAlteredHandler(data){
		var message = 'Account settings successfully altered. ';

		if(data.success)
			$('#modal-account-settings').modal('hide');
		else
		{
			var errors = data.errors;
			var errorsStr = '';

			errors.forEach(function(error){
				errorsStr += error + '<br />';
			});

			message = errorsStr;
		}

		BootstrapDialog.show({
			type: data.success ? BootstrapDialog.TYPE_SUCCESS : BootstrapDialog.TYPE_DANGER,
			title: "Account settings status",
			message: message
		});
	}

	$('#logout-option-link').on('click', function(){
		$.ajax({
			type:'get',
			processData: false,
			contentType: false,
			url:'backend/view/UsersView.php',
			dataType: 'json',
			data:'path=log-user-out',
			success:function(data){
				BootstrapDialog.show({
					type: data.success ? BootstrapDialog.TYPE_SUCCESS : BootstrapDialog.TYPE_DANGER,
					title: 'Logout status',
					message: data.message
				});

				if(data.success)
					activateModalLogin();
			},
			error:function(data){
				console.log(data);
			}
		});
	});
});