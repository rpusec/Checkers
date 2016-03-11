<?php 

require_once('validation.php');

class ValidationHelper
{
	private static $errors = array();
	
	public static function hasErrors(){
		return !empty(self::$errors);
	}
	
	public static function getErrors(){
		return self::$errors;
	}
	
	public static function checkAppropriateInputLength($input, $lengthFrom, $lengthTo, $inputLabel){
		$errorMessage = ucfirst($inputLabel) . ' input size should be between ' . $lengthFrom . ' and ' . $lengthTo . ' in length. ';

		if(is_string($input))
		{
			if(strlen($input) < $lengthFrom || strlen($input) > $lengthTo)
				self::$errors[] = $errorMessage;
		}
		else
		{
			if($input < $lengthFrom || $input > $lengthTo)
				self::$errors[] = $errorMessage;
		}
	}
	
	public static function validateInput($input, $validationFunct, $errorMessage, $bool = FALSE){
		if(call_user_func($validationFunct, $input) == $bool)
			self::$errors[] = $errorMessage;
	}

	public static function checkIfEqual($value1, $value2, $label1, $label2){
		if($value1 != $value2)
			self::$errors[] = ucfirst($label1) . ' value is inequivalent to ' . $label2 . ' value. ';
	}
}