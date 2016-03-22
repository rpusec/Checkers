<?php 

require_once('validation.php');

/**
 * Helper class for user input validations deriven from the client side. 
 * @see validation.php file which is used in combination with this class. 
 *
 * Some of these functions (checkAppropriateInputLength and checkIfEqual) auto-generate
 * an appropriate error message if the input validation turned out to be unsuccessful. 
 * Though function validateInput requires a potential error message as a parameter. 
 * 
 * @author Roman Pusec
 */
class ValidationHelper
{
	//list of all errors 
	private static $errors = array();
	
	/**
	 * Checks if any errors have been made. 
	 * @return boolean True if there were not validation errors, false otherwise. 
	 */
	public static function hasErrors(){
		return !empty(self::$errors);
	}
	
	/**
	 * Returns the list of errors. 
	 * @return Array The list of errors. 
	 */
	public static function getErrors(){
		return self::$errors;
	}
	
	/**
	 * Checks if the length of the input is appropriate. The function also 
	 * can determine whether the input is a number or a string. 
	 *
	 * The function will also generate an error message. The message would look as follows: 
	 * '$inputLabel input size should be between $lengthFrom and $lengthTo in length.' 
	 * 
	 * @param  [Number/String] $input The target user input to be evaluated. 
	 * @param  [Number] $lengthFrom The smallest value for the input. 
	 * @param  [Number] $lengthTo The largest possible value for the input. 
	 * @param  [String] $inputLabel The label of the input (e.g. if a username is in question, then the label value would be 'username'). 
	 */
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
	
	/**
	 * Validates the user input by using one of the validation functions. 
	 * @see validation.php for a list of available validation functions to use. 
	 * @param  [String]  $input           User input to be validated. 
	 * @param  [String]  $validationFunct Target validation function to be used to validate the input. 
	 * @param  [String]  $errorMessage    Expected error message. 
	 * @param  [Boolean] $bool            True if the validation function should return the opposite boolean of what it would initially return. 
	 */
	public static function validateInput($input, $validationFunct, $errorMessage, $bool = FALSE){
		if(call_user_func($validationFunct, $input) == $bool)
			self::$errors[] = $errorMessage;
	}

	/**
	 * Checks if two values are equal. The label parameters represent what the values themselves stand for (e.g. if the first value
	 * represents the user's first name, then the value for that parameter would be 'first name'). 
	 * @param  [String] $value1 The first value. 
	 * @param  [String] $value2 The second value. 
	 * @param  [String] $label1 The label of the first value. 
	 * @param  [String] $label2 The label of the second value. 
	 */
	public static function checkIfEqual($value1, $value2, $label1, $label2){
		if($value1 != $value2)
			self::$errors[] = ucfirst($label1) . ' value is inequivalent to ' . $label2 . ' value. ';
	}
}