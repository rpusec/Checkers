<?php

require_once('UserValidator.class.php');

class ChatLogic
{
    public function checkAppropriateInputLength($message){
        UserValidator::checkAppropriateInputLength($message, MIN_MESSAGE_SIZE, MAX_MESSAGE_SIZE, 'message');
	
        if(UserValidator::hasErrors())
                return array(
                        'success' => false,
                        'errors' => UserValidator::getErrors()
        );
        
        return null;
    }
}