<?php

require_once('../helper/UserValidator.class.php');
require_once('../config/constants.php');

class ChatLogic
{
	public static function checkAppropriateInputLength($message){
		UserValidator::checkAppropriateInputLength($message, MIN_MESSAGE_SIZE, MAX_MESSAGE_SIZE, 'message');

		if(UserValidator::hasErrors())
			return array(
				'success' => false,
				'errors' => UserValidator::getErrors()
		);

		return null;
	}
}