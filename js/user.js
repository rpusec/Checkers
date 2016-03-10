$(document).on('ready', function(){
	$('#modal-login').find('input[name=username]').on('keypress', luKeyHandler);
	$('#modal-login').find('input[name=password]').on('keypress', luKeyHandler);
	$('#modal-login').find('button[name="submit-btn"]').on('click', loginUser);

	function luKeyHandler(e){
		var key = e.which || e.keyCode;
		
		if(key !== 13)
			return;

		loginUser();
	}

	function loginUser(){
		var form = $('#modal-login').find('form').eq(0);
		var username = form.find('#username').val();
		var password = form.find('#password').val();

		var formData = new FormData();
		formData.append('username', username);
		formData.append('password', password);
		formData.append('path', 'login-user');

		$.ajax({
			type:'post',
			processData: false,
			contentType: false,
			url:'backend/view/UsersView.php',
			dataType: 'json',
			data:formData,
			success:function(data){
				if(data.success){
					$('#modal-login').off('hidden.bs.modal');
					$('#modal-login').modal('hide');
				}
				else
				{
					BootstrapDialog.show({
						type: BootstrapDialog.TYPE_DANGER,
						title: "Error",
						message: 'Wrong username / password. '
					});
				}
			},
			error:function(data){
				console.log(data);
			}
		});
	}

	$('#modal-signup').find('button[name="submit-btn"]').on('click', function(){

		var form = $('#modal-signup').find('form').eq(0);
		var firstname = form.find('#firstname').val();
		var lastname = form.find('#lastname').val();
		var username = form.find('#username').val();
		var password = form.find('#password').val();
		var passwordConfirm = form.find('#passwordConfirm').val();

		var formData = new FormData();
		formData.append('firstname', firstname);
		formData.append('lastname', lastname);
		formData.append('username', username);
		formData.append('password', password);
		formData.append('passwordConfirm', passwordConfirm);
		formData.append('path', 'register-user');

		$.ajax({
			type:'post',
			processData: false,
			contentType: false,
			url:'backend/view/UsersView.php',
			dataType: 'json',
			data:formData,
			success:function(data){
				console.log(data);
			},
			error:function(data){
				console.log(data);
			}
		});
	});
});