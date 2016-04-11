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
}