/**
 * Object which contains different 
 * constants used in the game. 
 * @author Roman Pusec
 */
var Constants = {
	
	//base game config
	FPS: 60,
	MOUSE_OVER_FREQ: 5,

	//two repeating colors
	COLOR_ONE: '#fff', 
	COLOR_TWO: '#1A1A1B',
	
	//game display object alignment 
	TEXT_PADDING: 25,
	WM_SP_TO_BOTTOM: 40,
	DISAPPEARANCE_DIST: 60,
	PARTICLE_DISTANCE: 30,
	USER_PROFILE_MOVE: 50,
	GAME_ROOM_PADDING: 70,
	USER_PROFILE_AVATAR_SIZE: 30,
	PAWN_KILL_OFF_ROTATION_AMOUNT: 100,
	GAME_STAT_MAX_ROTATION: 100,

	//different types of pawns
	POLIGON_POINT_TYPE: [4, 6, 8, 10],
	
	//amount of pawns
	PAWN_AMOUNT: 1,
	GAME_ROOMS_PER_ROW: 3,

	//dalays
	GAME_ROOM_WAIT_TIME: 100,
	PAWN_KILL_OFF_DELAY: 500,

	//first and second player constants
	FIRST_PLAYER: 1,
	SECOND_PLAYER: 2,
	
	//interval duration constants
	CHECK_ROOM_AVAILABILITY_INTERVAL_DURATION: 2000,
	CHECK_IF_A_PLAYER_LEFT_INTERVAL_DURATION: 2000,
	CHECK_OPPONENT_INTERVAL_DURATION: 3000,
	CHECK_IF_OPPONENT_IS_DONE_INTERVAL_DURATION: 3000,
	
	//other constants
	MAX_USERS_PER_ROOM: 2,
	BOARD_ROW_SEPARATOR: '|',
	BACKEND_FUNC_CALL_PARAM: 'path',

	//URIs
	ROOM_VIEW_URI: 'backend/view/RoomView.php',
	GAME_VIEW_URI: 'backend/view/GameView.php'
};