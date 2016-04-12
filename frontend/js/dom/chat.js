$(document).on('ready', function(){

	var arrOnlineUserInfo = {};

	/**
	 * Represents the information of a user who's logged in. 
	 * @param {String} firstname The first name of the user. 
	 * @param {String} lastname  The last name of the user. 
	 * @param {String} username  The username of the user. 
	 */
	function OnlineUserInfo(firstname, lastname, username, won, lost){
		this.firstname = firstname;
		this.lastname = lastname;
		this.username = username;
		this.won = parseInt(won);
		this.lost = parseInt(lost);
	}

	//executes an anonymous function when the chat input is focused
	$('#main-container').find('#chat-input').on('keypress', function(e){
		var key = e.which || e.keyCode;
		
		//ends the function if the enter key wasn't pressed or if the 
		//chat input field is empty 
		if(key !== 13 || $(this).val() === '')
			return;

		var formDataSM = new FormData();
		formDataSM.append('message', $(this).val());
		formDataSM.append('path', 'send-message');
		$(this).val('');

		$.ajax({
			type:'post',
			processData: false,
			contentType: false,
			url:'backend/view/ChatView.php',
			dataType: 'json',
			data:formDataSM,
			success: function(data){
				if(!data.success)
				{					
					BootstrapDialog.show({
						type: BootstrapDialog.TYPE_DANGER,
						title: "Error",
						message: formatLineByLine(data.errors)
					});
				}
			},
			error: function(data){
				console.log(data);
			}
		});
	});

	var GET_MESSAGES_PING_TIME = 1500;
	var CHECK_WHO_IS_ONLINE_PING_TIME = 2500;

	var lastMessageID = -1;

	//pings the server every [GET_MESSAGES_PING_TIME] 
	//milliseconds to check for new messages
	setInterval(function(){
		$.ajax({
			type:'get',
			processData: false,
			contentType: false,
			url:'backend/view/ChatView.php',
			dataType: 'json',
			data:'path=get-message',
			success: messageGetHandler,
			error: function(data){
				console.log(data);
			}
		});
	}, GET_MESSAGES_PING_TIME);

	//checks who is online and displays the usernames 
	//every [CHECK_WHO_IS_ONLINE_PING_TIME] milliseconds
	setInterval(function(){
		$.ajax({
			type:'get',
			processData: false,
			contentType: false,
			url:'backend/view/UsersView.php',
			dataType: 'json',
			data:'path=who-is-online',
			success: whoIsOnlineHandlerSuccess,
			error: function(data){
				console.log(data);
			}
		});
	}, CHECK_WHO_IS_ONLINE_PING_TIME);

	/**
	 * Presents the messages fetched from the server. 
	 * @param  {Object} data Object which includes the messages and the success flag. 
	 */
	function messageGetHandler(data){
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

	var CONN_USER_PREFIX = 'conn_user_';

	/**
	 * Updates the chat screen with new online users 
	 * and excludes those that have logged out. 
	 * @param  {Object} data Plain object which includes the information from the appropriate AJAX request. 
	 */
	function whoIsOnlineHandlerSuccess(data){
		if(!data.success)
			return;

		var connectedUsers = data.connectedUsers;
		var loggedUserID = data.loggedUserID; 

		//adds the potential users to the chat screen
		for(var i = 0; i < connectedUsers.length; i++)
		{
			var connUser = connectedUsers[i];
			var connUserDom = $('#chat-contact-list').find('#' + CONN_USER_PREFIX + connUser.userID);

			//if the target user isn't displayed on the chat list
			if(connUserDom.length === 0)
			{
				if(connUser.userID === loggedUserID)
				{
					connUser.chatColorR = 255;
					connUser.chatColorG = 255;
					connUser.chatColorB = 255;
				}

				arrOnlineUserInfo[CONN_USER_PREFIX + connUser.userID] = new OnlineUserInfo(connUser.firstname, connUser.lastname, connUser.username, connUser.won, connUser.lost);

				var $newConnUser = $('<div><span>' + connUser.username + '</span></div>');
				$newConnUser.attr('class', 'user-connected');
				$newConnUser.attr('id', CONN_USER_PREFIX + connUser.userID);
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

				var targetUserInfo = arrOnlineUserInfo[CONN_USER_PREFIX + connUser.userID];
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

				if(CONN_USER_PREFIX + connUser.userID === $(cclVal).attr('id'))
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
});