$(document).ready(function(){
	
	$('#modal-login').modal('show');

	$('#sign-up-btn').on('click', function(){
		$('#modal-signup').modal('show');
	});

	$('#modal-login').on('hidden.bs.modal', function(e){
		if(!$('#modal-signup').is(':visible'))
			$('#modal-login').modal('show');
	});

	$('#modal-signup').on('hidden.bs.modal', function(){
		$('#modal-login').modal('show');
	});

});