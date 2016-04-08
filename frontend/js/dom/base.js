$(document).ready(function(){

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
	 * Ajax request which checks if the user already is logged in.
	 */
	window.checkLoginStatusAJAXCall = function(){
		$.ajax({
			type:'get',
			processData: false,
			contentType: false,
			url:'backend/view/UsersView.php',
			dataType: 'json',
			data:'path=is-user-logged',
			success: isUserLoggedHandlerSuccess,
			error: function(data){
				console.log(data);
			}
		});
	}

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

	/**
	 * Function which is executed when the appropriate AJAX request has been successfully executed. 
	 * Checks if the user already is logged in, in that case it deactivates the modal login 
	 * window and initializes the game, otherwise it provides the user with the modal login window. 
	 * @param  {Object}  data Plain object which provides with a 'isLogged' flag which indicates 
	 *                        whether the user already is logged in. 
	 */
	function isUserLoggedHandlerSuccess(data){
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
});