<?php

#dirs
define('DBINFO_PATH', '../../dbinfo.php');

#exparation time
define('MESSAGE_EXPARATION_TIME', 20);
define('CONN_EXPARATION_TIME', 5);

#messages
define('USER_NOT_LOGGED_MSG', 'You\'re not logged into the application. ');
define('CANNOT_SEND_MESSAGES', 'Can\'t send a new message. ' . USER_NOT_LOGGED_MSG);
define('CANNOT_RETRIEVE_MESSAGES', 'Can\'t retrieve a new message. ' . USER_NOT_LOGGED_MSG);
define('USER_LOGOUT_MSG', 'You logged out of the application. ');
define('USER_LOGOUT_ERROR_MSG', 'You\'re already logged off. ');
define('ALREADY_CONNECTED_ERROR_MSG', 'You\'re already connected from somewhere else. If you\'re sure you are not, then try again in a few seconds. ');
define('USERNAME_NOT_UNIQUE_ERROR_MSG', 'The provided username is not unique. ');
define('ROOM_MAX_NUM_OF_USERS_MSG', 'The room is unavailable. Maximum amount of users has already been reached. ');
define('ILLEGAL_INPUT_ERROR_MSG_PART', 'Illegal value supplied for ');
define('ALPHABETIC_ERROR_MSG_PART', ' should be alphabetic. ');
define('PAWN_NOT_YOURS_ERROR_MSG', 'The pawn is not yours. ');
define('PREV_NEW_POS_INEQUALITY_ERROR_MSG', 'Previous position should not be equivalent to the new position. ');
define('ILLEGAL_PREV_POSITION_ERROR_MSG', 'Illegally supplied previous position. ');
define('NEW_POS_NOT_A_PAWN_ERROR_MSG', 'New position should not be a pawn, but an empty field. ');
define('NOT_YOUR_TURN_ERROR_MSG', 'It\'s not your turn. ');

#chat
define('CHAT_COLOR_BRIGHTNESS', 222);

#user input size
define('MAX_MESSAGE_SIZE', 200);
define('MIN_MESSAGE_SIZE', 1);
define('MAX_USERNAME_INPUT_SIZE', 20);
define('MIN_USERNAME_INPUT_SIZE', 3);
define('MAX_PASSWORD_INPUT_SIZE', 20);
define('MIN_PASSWORD_INPUT_SIZE', 8);
define('MAX_FNAME_INPUT_SIZE', 25);
define('MIN_FNAME_INPUT_SIZE', 3);
define('MAX_LNAME_INPUT_SIZE', 25);
define('MIN_LNAME_INPUT_SIZE', 3);

#first and second player
define('FIRST_PLAYER', 1);
define('SECOND_PLAYER', 2);

#duration
define('TURN_DURATION', 15);

#board values
define('ROOM_MAX_AMOUNT_OF_USERS', 2);
define('BOARD_MAX_COL_AMOUNT', 8);
define('BOARD_MAX_ROW_AMOUNT', 8);
define('PLAYER_PAWNS_AMOUNT', 12);

#stringified board
define('BOARD_BG', 0);
define('BOARD_COL_SEPARATOR', ',');
define('BOARD_ROW_SEPARATOR', '|');
define('PLAYER_TWO_ROW_POSITION', 6);