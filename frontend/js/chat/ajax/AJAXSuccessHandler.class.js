/**
 * This class contains all of the AJAX call success handler 
 * functions used in the chat and user portions of the application.  
 * @class
 * @author Roman Pusec
 * @namespace rpcheckers.chat.ajax
 */
rpcheckers.chat.ajax.AJAXSuccessHandler = {};

(function(){

	var	ns = rpcheckers.chat.ajax.AJAXSuccessHandler
	,	Constants;

	var arrOnlineUserInfo = {};
	var lastMessageID = -1;

	/**
	 * Inizializes the object. 
	 * @constructor
	 */
	ns.initialize = function(){
		Constants = rpcheckers.chat.config.Constants;
	}

	/**
	 * Checks whether there are any new messages that haven't been
	 * previously displayed. 
	 * The last message is marked by its ID in the 'lastMessageID'
	 * variable. 
	 * @param  {Object} data Data from the server. 
	 */
	ns.checkForNewMessagesSuccessHandler = function(data){
		if(!data.success)
			return;

		var messages = data.messages;
		var loggedUserID = data.loggedUserID;

		for(var i = 0; i < messages.length; i++){

			var message = messages[i];

			//checks if the current message was already displayed 
			//if it was, continue to the next message
			if(lastMessageID !== -1)
				if(message.messageID <= lastMessageID)
					continue;

			//making the logged in user white
			if(message.userID === loggedUserID)
			{
				message.firstName = 'You';
				message.chatColorR = 255;
				message.chatColorG = 255;
				message.chatColorB = 255;
			}

			//creates the message bubble
			var rgbStr = 'rgb(' + message.chatColorR + ',' + message.chatColorG + ',' + message.chatColorB + ')';
			var msgDOM = document.createElement('div');
			msgDOM.setAttribute('class', 'user-message');
			msgDOM.setAttribute('style', 'background-color: ' + rgbStr + '; box-shadow: 0px 0px 15px ' + rgbStr + '; ');
			msgDOM.innerHTML = '<span><b>' + message.firstName + ' say' + (message.userID === loggedUserID ? '' : 's') + ': </b>' + message.message + '</span>';
			
			//marks the last message with the current message
			lastMessageID = message.messageID;

			//appends the message to the chat
			$('#chat-window').append(msgDOM);
			$(msgDOM).toggleBubbleOn(function(){
				$('#chat-window').scrollTop($('#chat-window').width());
			});
		}
	}

	/**
	 * Executed upon sending a message. The only purpose 
	 * is to display any errors after the request. 
	 * @param  {Object} data Data from the server. 
	 */
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

	/**
	 * Checks which users are online and displays them to the chat screen. 
	 * @param  {Object} data Data from the server. 
	 */
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

			//if the username is greater than Constants.USERNAME_CHATLIST_SIZE in length, then it displays only a part of the username on the chatlist
			var usernameToDisplay = connUser.username.length > Constants.USERNAME_CHATLIST_SIZE ? connUser.username.substr(0, Constants.USERNAME_CHATLIST_SIZE) + '...' : connUser.username;

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

				var $newConnUser = $('<div><span>' + usernameToDisplay + '</span></div>');
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
					$(connUserDom).find('span').text(usernameToDisplay);

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

}());