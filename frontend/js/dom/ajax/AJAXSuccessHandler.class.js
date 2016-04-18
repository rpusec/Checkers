rpcheckers.dom.ajax.AJAXSuccessHandler = {};

(function(){

	var	ns = rpcheckers.dom.ajax.AJAXSuccessHandler
	,	Constants;

	var arrOnlineUserInfo = {};
	var lastMessageID = -1;

	ns.initialize = function(){
		Constants = rpcheckers.dom.config.Constants;
	}

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

	ns.checkForNewMessagesSuccessHandler = function(data){
		if(!data.success)
			return;

		var messages = data.messages;
		var loggedUserID = data.loggedUserID;

		for(var i = 0; i < messages.length; i++){

			var message = messages[i];

			//checks if the current message was already displayed 
			if(lastMessageID !== -1)
				if(message.messageID <= lastMessageID)
					continue;

			if(message.userID === loggedUserID)
			{
				message.firstName = 'You';
				message.chatColorR = 255;
				message.chatColorG = 255;
				message.chatColorB = 255;
			}

			var rgbStr = 'rgb(' + message.chatColorR + ',' + message.chatColorG + ',' + message.chatColorB + ')';
			var msgDOM = document.createElement('div');
			msgDOM.setAttribute('class', 'user-message');
			msgDOM.setAttribute('style', 'background-color: ' + rgbStr + '; box-shadow: 0px 0px 15px ' + rgbStr + '; ');
			msgDOM.innerHTML = '<span><b>' + message.firstName + ' say' + (message.userID === loggedUserID ? '' : 's') + ': </b>' + message.message + '</span>';
			lastMessageID = message.messageID;

			$('#chat-window').append(msgDOM);
			$(msgDOM).toggleBubbleOn(function(){
				$('#chat-window').scrollTop($('#chat-window').width());
			});
		}
	}

	ns.checkWhoIsOnlineSuccessHandler = function(data){
		if(!data.success)
			return;

		var connectedUsers = data.connectedUsers;
		var loggedUserID = data.loggedUserID; 

		//adds the potential users to the chat screen
		for(var i = 0; i < connectedUsers.length; i++)
		{
			var connUser = connectedUsers[i];
			var connUserDom = $('#chat-contact-list').find('#' + Constants.CONN_USER_PREFIX + connUser.userID);

			//if the target user isn't displayed on the chat list
			if(connUserDom.length === 0)
			{
				if(connUser.userID === loggedUserID)
				{
					connUser.chatColorR = 255;
					connUser.chatColorG = 255;
					connUser.chatColorB = 255;
				}

				arrOnlineUserInfo[Constants.CONN_USER_PREFIX + connUser.userID] = new OnlineUserInfo(connUser.firstname, connUser.lastname, connUser.username, connUser.won, connUser.lost);

				var $newConnUser = $('<div><span>' + connUser.username + '</span></div>');
				$newConnUser.attr('class', 'user-connected');
				$newConnUser.attr('id', Constants.CONN_USER_PREFIX + connUser.userID);
				var $bgColor = 'rgba(' + connUser.chatColorR + ',' + connUser.chatColorG + ',' + connUser.chatColorB + ', 1)';
				$newConnUser.css('background-color', $bgColor);
				$newConnUser.css('box-shadow', '0px 0px 20px ' + $bgColor);
				$('#chat-contact-list').append($newConnUser);
				$($newConnUser).toggleBubbleOn();
				$($newConnUser).hover(
					function(){
						var targetUserInfo = arrOnlineUserInfo[this.id];
						$('#single-user-info').html(
							'<span style="font-size: 30px;">' + targetUserInfo.firstname + ' ' + targetUserInfo.lastname + '</span>' + 
							'<br />' + targetUserInfo.username + 
							'<br />Won ' + targetUserInfo.won + ' time' + (targetUserInfo.won === 1 ? '' : 's') + ', ' +
							'lost ' + targetUserInfo.lost + ' time' + (targetUserInfo.lost === 1 ? '' : 's') + '. ');

						$('#single-user-info').css('visibility', 'visible');
						$('#single-user-info').css({
							top: $(this).offset().top,
							left: $(this).offset().left - $('#single-user-info').width()
						});

					}, function(){
						$('#single-user-info').css('visibility', 'hidden');
						$('#single-user-info').text('Loading... ');
					});
			}
			else
			{
				if($(connUserDom).find('span').text() !== connUser.username)
					$(connUserDom).find('span').text(connUser.username);

				var targetUserInfo = arrOnlineUserInfo[Constants.CONN_USER_PREFIX + connUser.userID];
				targetUserInfo.firstname = connUser.firstname;
				targetUserInfo.lastname = connUser.lastname;
				targetUserInfo.username = connUser.username;
				targetUserInfo.won = parseInt(connUser.won);
				targetUserInfo.lost = parseInt(connUser.lost);
			}
		}

		//removes the users from the chat screen, if there are any to remove 
		$.each($('#chat-contact-list').children(), function(cclKey, cclVal){

			var found = false;

			for(var i = 0; i < connectedUsers.length; i++)
			{
				var connUser = connectedUsers[i];

				if(Constants.CONN_USER_PREFIX + connUser.userID === $(cclVal).attr('id'))
				{
					found = true;
					break;
				}
			}

			if(!found)
			{
				if(arrOnlineUserInfo.hasOwnProperty($(cclVal).attr('id')))
					delete arrOnlineUserInfo[$(cclVal).attr('id')];

				$(cclVal).toggleBubbleOff();
			}
		});
	}

	ns.sendMessageSuccessHandler = function(data){
		if(!data.success)
		{					
			BootstrapDialog.show({
				type: BootstrapDialog.TYPE_DANGER,
				title: "Error",
				message: formatLineByLine(data.errors)
			});
		}
	}

	ns.loginUserSuccessHandler = function(data){
		if(data.success){
			deactivateModalLogin();
			initializeGame(data.hasOwnProperty('arrUserColor') ? data.arrUserColor : null);
		}
		else
		{
			BootstrapDialog.show({
				type: BootstrapDialog.TYPE_DANGER,
				title: "Error",
				message: data.hasOwnProperty('errors') ? formatLineByLine(data.errors) : 'Wrong username / password. '
			});
		}
	}

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
	}

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
			message = formatLineByLine(data.errors);

		BootstrapDialog.show({
			type: data.success ? BootstrapDialog.TYPE_SUCCESS : BootstrapDialog.TYPE_DANGER,
			title: "Account settings status",
			message: message
		});
	}

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

}());