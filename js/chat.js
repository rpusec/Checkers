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
				console.log(data);
			},
			error: function(data){
				console.log(data);
			}
		});
	});

	var PING_TIME = 1000;
	var lastMessageID = -1;

	//pings the server every [PING_TIME] milliseconds to check for new messages. 
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
	}, PING_TIME);

	/**
	 * Presents the messages fetched from the server. 
	 * @param  {Object} data Object which includes the messages and the success flag. 
	 */
	function messageGetHandler(data){
		if(!data.success)
			return;

		var messages = data.messages;

		for(var i = 0; i < messages.length; i++){

			var message = messages[i];

			//checks if the current message was already displayed 
			if(lastMessageID !== -1)
				if(message.messageID <= lastMessageID)
					continue;

			var msgDOM = document.createElement('div');
			msgDOM.setAttribute('class', 'user-message');
			msgDOM.setAttribute('style', 'background-color: rgb(' + message.chatColorR + ',' + message.chatColorG + ',' + message.chatColorB + ');');
			msgDOM.innerHTML = '<span><b>' + message.firstName + ' says: </b>' + message.message + '</span>';
			lastMessageID = message.messageID;

			$('#chat-window').append(msgDOM);

			$(msgDOM).hide();
			$(msgDOM).css('opacity', 0);
			$(msgDOM).find('span').css('opacity', 0);
			$(msgDOM).animate({
				height: 'toggle',
				opacity: 1
			}, 500, function(){
				$(this).find('span').animate({
					opacity: 1
				}, 500);
				$('#chat-window').scrollTop($('#chat-window').width());
			});
		}
	}
});