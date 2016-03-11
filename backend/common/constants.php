<?php

define('EXPARATION_TIME', 20);
define('USER_NOT_LOGGED_MSG', 'You\'re not logged into the application. ');
define('CANNOT_SEND_MESSAGES', 'Can\'t send a new message. ' . USER_NOT_LOGGED_MSG);
define('CANNOT_RETRIEVE_MESSAGES', 'Can\'t retrieve a new message. ' . USER_NOT_LOGGED_MSG);
define('USER_LOGOUT_MSG', 'You logged out of the application. ');
define('USER_LOGOUT_ERROR_MSG', 'You\'re already logged off. ');
define('CHAT_COLOR_BRIGHTNESS', 200);
define('MESSAGE_MAX_SIZE', 200);
define('MESSAGE_INPUT_SIZE_OVERLOAD_MSG', 'Message has to be at least ' . MESSAGE_MAX_SIZE . ' in length and not empty. ');

define('MAX_USERNAME_INPUT_SIZE', 40);
define('MIN_USERNAME_INPUT_SIZE', 3);
define('USERNAME_INPUT_ERROR_MSG', 'Username input size should be between ' . MIN_USERNAME_INPUT_SIZE . ' and ' . MAX_USERNAME_INPUT_SIZE . ' in length. ');

define('MAX_PASSWORD_INPUT_SIZE', 60);
define('MIN_PASSWORD_INPUT_SIZE', 8);
define('PASSWORD_INPUT_ERROR_MSG', 'Password input size should be between ' . MIN_PASSWORD_INPUT_SIZE . ' and ' . MAX_PASSWORD_INPUT_SIZE . ' in length. ');

define('MAX_FNAME_INPUT_SIZE', 15);
define('MIN_FNAME_INPUT_SIZE', 3);
define('FNAME_INPUT_ERROR_MSG', 'First name input size should be between ' . MIN_FNAME_INPUT_SIZE . ' and ' . MAX_FNAME_INPUT_SIZE . ' in length. ');

define('MAX_LNAME_INPUT_SIZE', 15);
define('MIN_LNAME_INPUT_SIZE', 3);
define('LNAME_INPUT_ERROR_MSG', 'Last name input size should be between ' . MIN_LNAME_INPUT_SIZE . ' and ' . MAX_LNAME_INPUT_SIZE . ' in length. ');

define('XSS_USERNAME_INPUT_ERROR_MSG', 'Illegal value supplied for username. ');
define('XSS_PASSWORD_INPUT_ERROR_MSG', 'Illegal value supplied for password. ');

define('PASS_EQUAL_ERROR_MSG', 'The supplied confirmation password is inequivalent to the initial password. ');