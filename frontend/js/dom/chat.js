$(document).on('ready', function(){

	var AJAXCallHandler = rpcheckers.dom.ajax.AJAXCallHandler;
	var AJAXCallIntervalHandler = rpcheckers.dom.ajax.AJAXCallIntervalHandler;
	AJAXCallHandler.initialize();
	AJAXCallIntervalHandler.initialize();

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

		AJAXCallHandler.sendMessageAJAXCall(formDataSM);
	});

	AJAXCallIntervalHandler.setCheckForNewMessagesInterval();
	AJAXCallIntervalHandler.setCheckWhoIsOnlineInterval();
});