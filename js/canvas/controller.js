(function(){

	var TEXT_PADDING = 25;
	var GAME_ROOMS_PER_ROW = 5;

	var stage
	,	gameNameText
	,	selARoomText;

	window.init = function(){

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

		stage.addChild(gameNameText, selARoomText);

		var lineShape = new InteractiveLine(
			'#ccc', 
			selARoomText.getBounds().height*2 + gameNameText.getBounds().height*2 + TEXT_PADDING, 
			stage.canvas.width);
		lineShape.toggle();

		window.lineShape = lineShape;

		stage.addChild(lineShape);

		var GAME_ROOM_TO_BOTTOM = 40;
		var gameRoomInitialY = lineShape.y-GAME_ROOM_TO_BOTTOM;
		var waitTime = 100;

		for(var i = 0; i < 3; i++)
		{
			for(var j = 0; j < GAME_ROOMS_PER_ROW; j++)
			{
				var newGameRoom = new GameRoom();
				var xside = stage.canvas.width/GAME_ROOMS_PER_ROW;
				newGameRoom.x = xside*j + newGameRoom.getBounds().width;
				newGameRoom.y = gameRoomInitialY + newGameRoom.getBounds().height + newGameRoom.getBounds().height*(i*3);
				stage.addChild(newGameRoom);
				newGameRoom.alpha = 0;
				createjs.Tween.get(newGameRoom).wait(waitTime).to({y: newGameRoom.y+GAME_ROOM_TO_BOTTOM, alpha: 1}, 500);
				waitTime += 100;
			}
		}
	}

}());