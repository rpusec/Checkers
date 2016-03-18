(function(){

	var TEXT_PADDING = 25;
	var GAME_ROOMS_PER_ROW = 3;

	var stage
	,	gameNameText
	,	selARoomText
	,	arrGameRoom = []
	,	gameInitialized = false
	,	lineShape;

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
			x: TEXT_PADDING,
			y: gameNameText.getBounds().height*2 + TEXT_PADDING
		});
	}

	window.initializeGame = function(){

		if(gameInitialized)
			return;

		gameInitialized = true;

		stage.addChild(gameNameText, selARoomText);

		lineShape = new InteractiveLine(
			'#ccc', 
			selARoomText.getBounds().height*2 + gameNameText.getBounds().height*2 + TEXT_PADDING, 
			stage.canvas.width);
		lineShape.toggle();

		stage.addChild(lineShape);

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

	function displayAllRoomsSuccess(data)
	{
		if(!data.success)
			return;

		var GAME_ROOM_TO_BOTTOM = 40;
		var gameRoomInitialY = lineShape.y-GAME_ROOM_TO_BOTTOM;
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
				col = 0;
				row++;
				i--;
			}
		}
	}

	window.uninitializeGame = function(){
		stage.removeAllChildren();
		stage.update();
		gameInitialized = false;
	}

}());