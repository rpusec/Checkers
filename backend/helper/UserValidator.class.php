<?php

require_once('BaseValidator.class.php');

class UserValidator extends BaseValidator
{
    public function validateSSXParanoidInput($input, $message){
        return parent::validateInput($input, 'crossSiteScriptingParanoid', $message, true);
    }
    
    public function validateAlphabeticSpaceInput($input, $message){
        return parent::validateInput($input, 'alphabeticSpace', $message);
    }

    public function checkIfUsernameExists($username){
    	DB::query("SELECT userID FROM user WHERE username=%s", $username);
		if(DB::count() > 0)
			parent::$errors[] = USERNAME_NOT_UNIQUE_ERROR_MSG;
    }
}