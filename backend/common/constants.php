<?php

define('MESSAGE_EXPARATION_TIME', 20);
define('CONN_EXPARATION_TIME', 5);

define('USER_NOT_LOGGED_MSG', 'You\'re not logged into the application. ');
define('CANNOT_SEND_MESSAGES', 'Can\'t send a new message. ' . USER_NOT_LOGGED_MSG);
define('CANNOT_RETRIEVE_MESSAGES', 'Can\'t retrieve a new message. ' . USER_NOT_LOGGED_MSG);
define('USER_LOGOUT_MSG', 'You logged out of the application. ');
define('USER_LOGOUT_ERROR_MSG', 'You\'re already logged off. ');
define('ALREADY_CONNECTED_ERROR_MSG', 'You\'re already connected from somewhere else. If you\'re sure you are not, then try again in a few seconds. ');

define('CHAT_COLOR_BRIGHTNESS', 222);

define('MAX_MESSAGE_SIZE', 200);
define('MIN_MESSAGE_SIZE', 1);

define('MAX_USERNAME_INPUT_SIZE', 40);
define('MIN_USERNAME_INPUT_SIZE', 3);

define('MAX_PASSWORD_INPUT_SIZE', 60);
define('MIN_PASSWORD_INPUT_SIZE', 8);

define('MAX_FNAME_INPUT_SIZE', 25);
define('MIN_FNAME_INPUT_SIZE', 3);

define('MAX_LNAME_INPUT_SIZE', 25);
define('MIN_LNAME_INPUT_SIZE', 3);

define('ILLEGAL_INPUT_ERROR_MSG_PART', 'Illegal value supplied for ');
define('ALPHABETIC_ERROR_MSG_PART', ' should be alphabetic. ');

define('FIRST_PLAYER', 1);
define('SECOND_PLAYER', 2);

define('ROOM_MAX_AMOUNT_OF_USERS', 2);

define('BOARD_MAX_COL_AMOUNT', 8);
define('BOARD_MAX_ROW_AMOUNT', 8);
define('PLAYER_PAWNS_AMOUNT', 12);

define('BOARD_COL_SEPARATOR', ',');
define('BOARD_ROW_SEPARATOR', '|');