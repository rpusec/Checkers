<?php 

class ValidationHelper
{
	private static $errors = array();
	
	public static function hasErrors(){
		return empty($this->errors);
	}
	
	public static function getErrors(){
		return $this->errors;
	}
	
	public static function checkAppropriateInputLength($input, $lengthFrom, $lengthTo, $errorMessage){
		if(is_string($input))
		{
			if(strlen($input) < $lengthFrom || strlen($input) > $lengthTo)
				$this->errors[] = $errorMessage;
		}
		else
		{
			if($input < $lengthFrom || $input > $lengthTo)
				$this->errors[] = $errorMessage;
		}
	}
	
	public static function validateInput($input, $validationFunct, $errorMessage){
		if($validationFunct($input))
			$this->errors[] = $errorMessage;
	}
}