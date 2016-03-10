$(document).on('ready', function(){
	$('#main-container').find('#chat-input').on('keypress', function(e){
		var key = e.which || e.keyCode;
		
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

	function messageGetHandler(data){
		if(!data.success)
			return;

		var messages = data.messages;

		for(var i = 0; i < messages.length; i++){

			var message = messages[i];

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