$(document).ready(function(){

	$('#sign-up-btn').on('click', function(){
		$('#modal-signup').modal('show');
	});

	$('#modal-signup').on('hidden.bs.modal', function(){
		$('#modal-login').modal('show');
	});

	$.ajax({
		type:'get',
		processData: false,
		contentType: false,
		url:'backend/view/UsersView.php',
		dataType: 'json',
		data:'path=is-user-logged',
		success: isUserLoggedHandler,
		error: function(data){
			console.log(data);
		}
	});

	window.activateModalLogin = function(){
		$('#modal-login').modal('show');
		$('#modal-login').on('hidden.bs.modal', function(e){
			if(!$('#modal-signup').is(':visible'))
				$('#modal-login').modal('show');
		});

		$.each($('#chat-window').children(), function(childKey, childVal){

			$(childVal).find('span').animate({
				opacity: 0
			}, 1000, function(){
				$(childVal).animate({
					height: 'toggle'
				}, 1000, function(){
					$(childVal).delete();
				});
			});
		});
	}

	window.deactivateModalLogin = function(){
		$('#modal-login').off('hidden.bs.modal');
		$('#modal-login').modal('hide');
	}

	function isUserLoggedHandler(data){
		if(data.isLogged)
			deactivateModalLogin();
		else
			activateModalLogin();
	}
});