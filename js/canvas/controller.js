/**
 * This file handles all of the necessary 
 * things relating to the game itself. 
 * @author Roman Pusec
 */
(function(){

	var stage
	,	gameNameText
	,	selARoomText
	,	board
	,	btnLeaveGame
	,	contGameRoom = new createjs.Container()
	,	gameInitialized = false;

	/**
	 * Initializes the core 
	 * attributes of the game. 
	 */
	window.init = function(){
		if(typeof stage === 'undefined')
			stage = new createjs.Stage('game-canvas');

		window.stage = stage;
		window.contGameRoom = contGameRoom;

		createjs.Ticker.setFPS(60);
		createjs.Ticker.addEventListener('tick', function(){stage.update();});
		stage.enableMouseOver(5);

		gameNameText = new AppearingText({
			text: 'Checkers',
			font: '20px Arial',
			x: stage.canvas.width/2,
			y: Constants.textPadding,
			textAlign: 'center'
		});

		selARoomText = new AppearingText({
			text: 'Please select a game room below...',
			font: '15px Arial',
			x: stage.canvas.width/2,
			y: gameNameText.getBounds().height*2 + Constants.textPadding,
			textAlign: 'center'
		});

		btnLeaveGame = new Button({text: 'Leave game...'}, function(){
			btnLeaveGame.disappear();
			createjs.Tween.get(board).to({y: stage.canvas.height, alpha: 0.5}, 1000, createjs.Ease.bounceOut).call(function(){
				gameNameText.show();
				selARoomText.show();
				board.alpha = 0;
				displayAllRoomsAJAXCall();
			});
		});

		btnLeaveGame.disappear(false);
		btnLeaveGame.x = Math.floor(btnLeaveGame.getBounds().width/2 + Constants.textPadding);
		btnLeaveGame.y = Math.floor(btnLeaveGame.getBounds().height/2 + Constants.textPadding);

		window.btnLeaveGame = btnLeaveGame;

		board = new Board();
		board.x = stage.canvas.width/2 - board.getBounds().width/2;
		board.y = stage.canvas.height;
		board.alpha = 0;
	}

	/**
	 * Pupulates the canvas with display objects and sends 
	 * an AJAX request to fetch the game rooms. 
	 */
	window.initializeGame = function(){
		if(gameInitialized)
			return;

		gameNameText.show();
		selARoomText.show();

		gameInitialized = true;
		stage.addChild(gameNameText, selARoomText, btnLeaveGame, board);
		displayAllRoomsAJAXCall();
	}

	/**
	 * AJAX call which displays all game rooms.  
	 */
	function displayAllRoomsAJAXCall(){
		contGameRoom.alpha = 1;

		$.ajax({
			type: 'get',
			processData: false,
			contentType: false,
			url: 'backend/view/RoomView.php',
			dataType: 'json',
			data: 'path=get-all-rooms',
			success: displayAllRoomsSuccess,
			error: function(data){
				console.log(data);
			}
		});
	}

	/**
	 * This function is executed if a specified AJAX request was handles successfully. 
	 * It returns the list of all available rooms from the backend and displays them 
	 * on the canvas.
	 * @param {Object} data A plain object which contains data from the backend. It includes a success flag, indicating 
	 *                      if the user's state is appropriate for this request, and the array of rooms. 
	 */
	function displayAllRoomsSuccess(data)
	{
		if(!data.success)
			return;

		var GAME_ROOM_TO_BOTTOM = 40;
		var waitTime = Constants.GAME_ROOM_WAIT_TIME;

		var rooms = data.rooms;

		var row = 0;
		var col = 0;

		for(var i = 0; i < rooms.length; i++)
		{
			if(col !== Constants.GAME_ROOMS_PER_ROW)
			{
				//creates a new GameRoom display object
				var ROOM_PADDING = 70;
				var newGameRoom = new GameRoom({roomID: rooms[i].roomID});
				newGameRoom.x = (newGameRoom.getBounds().width + ROOM_PADDING) * col;
				newGameRoom.y = (newGameRoom.getBounds().height + ROOM_PADDING) * row;
				contGameRoom.addChild(newGameRoom);
				newGameRoom.alpha = 0;

				//when a GameRoom icon is clicked 
				newGameRoom.on('click', function(){

					//hiding the texts 
					gameNameText.hide();
					selARoomText.hide();

					//removing all of the mouse events from all 
					//of the GameRoom display objects 
					contGameRoom.children.forEach(function(gameRoom){
						gameRoom.removeMouseEvents();
					});

					//setting the GameRoom container below the stage and setting its alpha to zero
					createjs.Tween.get(contGameRoom).to({y: stage.canvas.height, alpha: 0}, 1000).call(function(){
						contGameRoom.removeAllChildren();
						stage.removeChild(contGameRoom);

						//displaying the board to the center of the canvas 
						createjs.Tween.get(board).to({y: stage.canvas.height/2 - board.getBounds().height/2, alpha: 1}, 1000, createjs.Ease.backOut).call(function(){
							btnLeaveGame.appear();
						});
					});
				});

				//each next GameRoom icon appears [GAME_ROOM_WAIT_TIME] milliseconds before the previous one 
				createjs.Tween.get(newGameRoom).wait(waitTime).to({y: newGameRoom.y+GAME_ROOM_TO_BOTTOM, alpha: 1}, 500).call(function(){
					this.addMouseEvents();
				});

				col++;
				waitTime += Constants.GAME_ROOM_WAIT_TIME;
			}
			else
			{
				//goes to next line if the column was 
				//equal to the [GAME_ROOMS_PER_ROW] constant
				col = 0;
				row++;
				i--;
			}
		}

		contGameRoom.x = stage.canvas.width/2 - contGameRoom.getBounds().width/2;
		contGameRoom.y = stage.canvas.height/2 - contGameRoom.getBounds().height/2 - GAME_ROOM_TO_BOTTOM;
		stage.addChild(contGameRoom);
	}

	/**
	 * Removes all children from the canvas. 
	 */
	window.uninitializeGame = function(){
		createjs.Tween.removeAllTweens();
		stage.removeAllChildren();
		contGameRoom.removeAllChildren();
		stage.update();
		gameInitialized = false;
	}

}());