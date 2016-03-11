$(document).on('ready', function(){

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
					var errors = data.errors;
					var errorsStr = '';
					
					errors.forEach(function(error){
						errorsStr += error + "<br />";
					});
					
					BootstrapDialog.show({
						type: BootstrapDialog.TYPE_DANGER,
						title: "Error",
						message: errorsStr
					});
				}
			},
			error: function(data){
				console.log(data);
			}
		});
	});

	var GET_MESSAGES_PING_TIME = 1000;
	var CHECK_WHO_IS_ONLINE_PING_TIME = 5000;

	var lastMessageID = -1;

	//pings the server every [GET_MESSAGES_PING_TIME] milliseconds to check for new messages. 
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

	/*setInterval(function(){
		$.ajax({
			type:'get',
			processData: false,
			contentType: false,
			url:'backend/view/UsersView.php',
			dataType: 'json',
			data:'path=who-is-online',
			success: whoIsOnlineHandler,
			error: function(data){
				console.log(data);
			}
		});
	}, CHECK_WHO_IS_ONLINE_PING_TIME);*/

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

			var msgDOM = document.createElement('div');
			msgDOM.setAttribute('class', 'user-message');
			msgDOM.setAttribute('style', 'background-color: rgb(' + message.chatColorR + ',' + message.chatColorG + ',' + message.chatColorB + ');');
			msgDOM.innerHTML = '<span><b>' + message.firstName + ' say' + (message.userID === loggedUserID ? '' : 's') + ': </b>' + message.message + '</span>';
			lastMessageID = message.messageID;

			$('#chat-window').append(msgDOM);
			$(msgDOM).toggleBubbleOn(function(){
				$('#chat-window').scrollTop($('#chat-window').width());
			});
		}
	}

	var data = {
		success: true,
		connectedUsers: [
			{
				chatColorR:255,
				chatColorG:0,
				chatColorB:0,
				firstname: 'roman',
				lastname: 'pusec',
				userID: 1,
				username: 'rpusec'
			},
			{
				chatColorR:0,
				chatColorG:255,
				chatColorB:0,
				firstname: 'roman',
				lastname: 'pusec',
				userID: 2,
				username: 'rpusec'
			},
			{
				chatColorR:0,
				chatColorG:0,
				chatColorB:255,
				firstname: 'roman',
				lastname: 'pusec',
				userID: 3,
				username: 'rpusec'
			},
			{
				chatColorR:255,
				chatColorG:255,
				chatColorB:0,
				firstname: 'roman',
				lastname: 'pusec',
				userID: 4,
				username: 'rpusec'
			}
		]
	};

	var CONN_USER_PREFIX = 'conn_user_';

	window.whoIsOnlineHandler = function(data){
		if(!data.success)
			return;

		var connectedUsers = data.connectedUsers;

		for(var i = 0; i < connectedUsers.length; i++)
		{
			var connUser = connectedUsers[i];

			if($('#chat-contact-list').find('#' + CONN_USER_PREFIX + connUser.userID).length === 0)
			{
				var $newConnUser = $('<div><span>' + connUser.username + '</span></div>');
				$newConnUser.attr('class', 'user-connected');
				$newConnUser.attr('id', CONN_USER_PREFIX + connUser.userID);
				$newConnUser.css('background-color', 'rgb(' + connUser.chatColorR + ',' + connUser.chatColorG + ',' + connUser.chatColorB + ')');
				$('#chat-contact-list').append($newConnUser);
				$($newConnUser).toggleBubbleOn();
			}
		}

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
				$(cclVal).toggleBubbleOff();
				//$(cclVal).remove();
			}
		});
	}
});