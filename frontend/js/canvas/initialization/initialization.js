/**
 * Controller base class. 
 * @class 
 * @author Roman Pusec
 */
(function(){

	var	gameInitialized = false
	,	stage;

	/**
	 * Initializes the core 
	 * attributes of the game. 
	 */
	window.init = function(){
		stage = new createjs.Stage('game-canvas');

		window.stage = stage;

		createjs.Ticker.setFPS(Constants.FPS);
		createjs.Ticker.addEventListener('tick', function(){stage.update();});
		stage.enableMouseOver(Constants.MOUSE_OVER_FREQ);

		checkLoginStatusAJAXCall();
	}

	/**
	 * Pupulates the canvas with display objects and sends 
	 * an AJAX request to fetch the game rooms. 
	 */
	window.initializeGame = function(arrUserColor){
		if(gameInitialized)
			return;

		if(typeof arrUserColor === 'object')
			Constants.COLOR_ONE = 'rgb(' + arrUserColor.red + ', ' + arrUserColor.green + ', ' + arrUserColor.blue + ')';

		var gameNameText = new AppearingText({
			text: 'Checkers',
			font: '40px Arial',
			x: stage.canvas.width/2,
			y: Constants.TEXT_PADDING,
			textAlign: 'center'
		});

		var selARoomText = new AppearingText({
			text: 'Please select a game room below...',
			font: '20px Arial',
			x: stage.canvas.width/2,
			y: gameNameText.getBounds().height*2,
			textAlign: 'center'
		});

		var btnLeaveGame = new Button({text: 'Leave game...'}, function(){
			AJAXCallHandler.offGameRoomAJAXCall();
		});

		var wmSecondPlayer = new WaitingMessage({text: 'Waiting for second player...'});

		btnLeaveGame.disappear(false);
		btnLeaveGame.x = Math.floor(btnLeaveGame.getBounds().width/2 + Constants.TEXT_PADDING);
		btnLeaveGame.y = Math.floor(btnLeaveGame.getBounds().height/2 + Constants.TEXT_PADDING);

		var board = new Board();
		board.x = stage.canvas.width/2 - board.getBounds().width/2;
		board.y = stage.canvas.height;
		board.alpha = 0;

		BlockSelectabilityLogic.setBoard(board);
		BoardLogic.setBoard(board);

		gameNameText.show();
		selARoomText.show();

		var turnTimer = new TurnTimer({
			onEndHandler: function(){
				AJAXCallHandler.notifyTimeOutAJAXCall();
			},
			x: stage.canvas.width,
			y: stage.canvas.height
		});

		window.turnTimer = turnTimer;

		ParticleFactory.initialize({stage: stage});

		AJAXSuccessHandler.initializeAllProperties({
			stage: stage,
			gameNameText: gameNameText,
			selARoomText: selARoomText,
			board: board,
			btnLeaveGame: btnLeaveGame,
			wmSecondPlayer: wmSecondPlayer,
			turnTimer: turnTimer
		});

		gameInitialized = true;
		stage.addChild(gameNameText, selARoomText, btnLeaveGame, board, turnTimer);
		AJAXCallHandler.displayAllRoomsAJAXCall();
	}

	/**
	 * Removes all children, tweens, 
	 * and events from the canvas. 
	 */
	window.uninitializeGame = function(){
		if(!gameInitialized)
			return;

		createjs.Tween.removeAllTweens();
		if(typeof stage !== 'undefined')
			stage.removeAllChildren();

		var contGameRoom = AJAXSuccessHandler.getAllProperties().contGameRoom;
		contGameRoom.removeAllChildren();
		contGameRoom.alpha = 1;

		if(typeof stage !== 'undefined')
			stage.update();

		gameInitialized = false;
		AJAXCallIntervalHandler.clearAllAJAXCallIntervals();
	}

}());