/**
 * This file handles all of the necessary things relating to the game itself. 
 * @author Roman Pusec
 */
(function(){

	//constants
	var TEXT_PADDING = 25;
	var GAME_ROOMS_PER_ROW = 3;

	var stage
	,	gameNameText
	,	selARoomText
	,	arrGameRoom = []
	,	gameInitialized = false;

	/**
	 * Initializes the core attributes of the game. 
	 */
	window.init = function(){
		if(typeof stage === 'undefined')
			stage = new createjs.Stage('game-canvas');

		window.stage = stage;

		createjs.Ticker.setFPS(60);
		createjs.Ticker.addEventListener('tick', function(){stage.update();});

		gameNameText = new AppearingText({
			text: 'Game name ',
			font: '20px Arial',
			x: stage.canvas.width/2,
			y: TEXT_PADDING,
			textAlign: 'center'
		});

		selARoomText = new AppearingText({
			text: 'Please select a game room below... ',
			font: '15px Arial',
			x: stage.canvas.width/2,
			y: gameNameText.getBounds().height*2 + TEXT_PADDING,
			textAlign: 'center'
		});
	}

	/**
	 * Pupulates the canvas with display objects and sends 
	 * an AJAX request to fetch the game rooms. 
	 */
	window.initializeGame = function(){

		if(gameInitialized)
			return;

		gameInitialized = true;

		stage.addChild(gameNameText, selARoomText);

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
		var gameRoomInitialY = selARoomText.y-GAME_ROOM_TO_BOTTOM;
		var waitTime = 100;

		var rooms = data.rooms;

		var row = 0;
		var col = 0;

		for(var i = 0; i < rooms.length; i++)
		{
			if(col !== GAME_ROOMS_PER_ROW)
			{
				var newGameRoom = new GameRoom({roomID: rooms[i].roomID});
				var xside = stage.canvas.width/GAME_ROOMS_PER_ROW;
				newGameRoom.x = xside*col + newGameRoom.getBounds().width;
				newGameRoom.y = gameRoomInitialY + newGameRoom.getBounds().height + newGameRoom.getBounds().height*(row*3);
				stage.addChild(newGameRoom);
				newGameRoom.alpha = 0;
				createjs.Tween.get(newGameRoom).wait(waitTime).to({y: newGameRoom.y+GAME_ROOM_TO_BOTTOM, alpha: 1}, 500);
				col++;
				waitTime += 100;
			}
			else
			{
				//goes to next line if the column was 
				//equal to the GAME_ROOMS_PER_ROW constant
				col = 0;
				row++;
				i--;
			}
		}
	}

	/**
	 * Removes all children from the canvas. 
	 */
	window.uninitializeGame = function(){
		stage.removeAllChildren();
		stage.update();
		gameInitialized = false;
	}

}());