$(document).ready(function(){
	var AJAXCallHandler = rpcheckers.dom.ajax.AJAXCallHandler;
	AJAXCallHandler.initialize();

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
});