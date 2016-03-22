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
	,	playerPawns
	,	opponentPawns
	,	playerOneProfile
	,	playerTwoProfile
	,	wmSecondPlayer
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

		createjs.Ticker.setFPS(Constants.FPS);
		createjs.Ticker.addEventListener('tick', function(){stage.update();});
		stage.enableMouseOver(Constants.MOUSE_OVER_FREQ);
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

		gameNameText = new AppearingText({
			text: 'Checkers',
			font: '40px Arial',
			x: stage.canvas.width/2,
			y: Constants.TEXT_PADDING,
			textAlign: 'center'
		});

		selARoomText = new AppearingText({
			text: 'Please select a game room below...',
			font: '20px Arial',
			x: stage.canvas.width/2,
			y: gameNameText.getBounds().height*2,
			textAlign: 'center'
		});

		btnLeaveGame = new Button({text: 'Leave game...'}, function(){
			$.ajax({
				type:'get',
				processData: false,
				contentType: false,
				url:'backend/view/RoomView.php',
				dataType: 'json',
				data:'path=remove-from-game-room',
				success: offGameSuccessHandler,
				error: function(data){
					console.log(data);
				}
			});
		});

		btnLeaveGame.disappear(false);
		btnLeaveGame.x = Math.floor(btnLeaveGame.getBounds().width/2 + Constants.TEXT_PADDING);
		btnLeaveGame.y = Math.floor(btnLeaveGame.getBounds().height/2 + Constants.TEXT_PADDING);

		board = new Board();
		board.x = stage.canvas.width/2 - board.getBounds().width/2;
		board.y = stage.canvas.height;
		board.alpha = 0;

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
				var newGameRoom = new GameRoom({roomID: rooms[i].roomID});
				newGameRoom.x = (newGameRoom.getBounds().width + Constants.GAME_ROOM_PADDING) * col;
				newGameRoom.y = (newGameRoom.getBounds().height + Constants.GAME_ROOM_PADDING) * row;
				contGameRoom.addChild(newGameRoom);
				newGameRoom.alpha = 0;

				//when a GameRoom icon is clicked 
				newGameRoom.on('click', function(){

					var targetRoomID = this.getRoomID()

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
						$.ajax({
							type:'get',
							processData: false,
							contentType: false,
							url:'backend/view/RoomView.php',
							dataType: 'json',
							data:'path=add-to-game-room&gameRoomID=' + targetRoomID,
							success: toGameRoomSuccessHandler,
							error: function(data){
								console.log(data);
							}
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

	function toGameRoomSuccessHandler(data){
		if(!data.success)
		{
			var errors = '';

			data.errors.forEach(function(error){
				errors += error + "<br />";
			});

			BootstrapDialog.show({
				type: BootstrapDialog.TYPE_DANGER,
				title: "Error",
				message: errors
			});

			return;
		}

		contGameRoom.removeAllChildren();
		stage.removeChild(contGameRoom);

		//displaying the board to the center of the canvas 
		createjs.Tween.get(board).to({y: stage.canvas.height/2 - board.getBounds().height/2, alpha: 1}, 1000, createjs.Ease.backOut).call(function(){
			BoardPawnFactory.resetSides();
			var pPawns = BoardPawnFactory.createPlayerOnePawns(board);
			var oPawns = BoardPawnFactory.createPlayerTwoPawns(board);

			btnLeaveGame.appear(null, function(){

				var playerOneProps = {
					side: UserGameProfile.RIGHT_SIDE, 
					avatar: pPawns.avatar
				};

				var playerTwoProps = {
					side: UserGameProfile.LEFT_SIDE, 
					avatar: oPawns.avatar
				};

				var WM_SP_TO_BOTTOM = 40;

				if(data.playerNumber === Constants.FIRST_PLAYER)
				{
					if(data.users[0].userID == data.loggedUserID)
					{
						playerOneProps.firstname = data.users[0].firstname;
						playerOneProps.lastname = data.users[0].lastname;
						playerOneProps.username = data.users[0].username;
					}

					wmSecondPlayer = new WaitingMessage({text: 'Waiting for second player...'});
					wmSecondPlayer.alpha = 0;
					wmSecondPlayer.x = stage.canvas.width/2;
					wmSecondPlayer.y = stage.canvas.height/2 - WM_SP_TO_BOTTOM;

					createjs.Tween.get(wmSecondPlayer).to({y: wmSecondPlayer.y + WM_SP_TO_BOTTOM, alpha: 1}, 500, createjs.Ease.backOut);
					stage.addChild(wmSecondPlayer);
				}
				else if(data.playerNumber === Constants.SECOND_PLAYER)
				{
					if(data.users[0].userID == data.loggedUserID)
					{
						playerOneProps.firstname = data.users[1].firstname;
						playerOneProps.lastname = data.users[1].lastname;
						playerOneProps.username = data.users[1].username;

						playerTwoProps.firstname = data.users[0].firstname;
						playerTwoProps.lastname = data.users[0].lastname;
						playerTwoProps.username = data.users[0].username;
					}
					else if(data.users[1].userID == data.loggedUserID)
					{
						playerOneProps.firstname = data.users[0].firstname;
						playerOneProps.lastname = data.users[0].lastname;
						playerOneProps.username = data.users[0].username;

						playerTwoProps.firstname = data.users[1].firstname;
						playerTwoProps.lastname = data.users[1].lastname;
						playerTwoProps.username = data.users[1].username;
					}
				}

				playerOneProfile = new UserGameProfile(playerOneProps);
				playerTwoProfile = new UserGameProfile(playerTwoProps);

				playerOneProfile.x = board.x + board.getBounds().width - playerOneProfile.getBounds().width + playerOneProfile.getMargin()*2 + playerOneProfile.getPadding()*2 + playerOneProfile.getFrameStrokeStyle();
				playerOneProfile.y = board.y/2 - playerOneProfile.getBounds().height/2;

				playerTwoProfile.x = board.x;
				playerTwoProfile.y = board.y + board.getBounds().height + (Math.abs(board.y + board.getBounds().height - stage.canvas.height)/2) - playerTwoProfile.getBounds().height/2;

				playerOneProfile.alpha = 0;
				playerTwoProfile.alpha = 0;

				playerOneProfile.x += Constants.USER_PROFILE_MOVE;
				playerTwoProfile.x -= Constants.USER_PROFILE_MOVE;

				createjs.Tween.get(playerOneProfile).to({x: playerOneProfile.x - Constants.USER_PROFILE_MOVE, alpha: 1}, 500, createjs.Ease.backOut);
				createjs.Tween.get(playerTwoProfile).to({x: playerTwoProfile.x + Constants.USER_PROFILE_MOVE, alpha: 1}, 500, createjs.Ease.backOut);

				stage.addChild(playerOneProfile, playerTwoProfile);
			});
			
			//spawns the player and opponent pawns 
			//and positiones them accordingly
			playerPawns = pPawns.list;
			opponentPawns = oPawns.list;

			(playerPawns.concat(opponentPawns)).forEach(function(pawn, pawnIndex){
				pawn.scaleX = 0;
				pawn.scaleY = 0;
				createjs.Tween.get(pawn).to({scaleX: 1, scaleY: 1}, 1500, createjs.Ease.quartInOut);
				stage.addChild(pawn);
			});
		});
	}

	function offGameSuccessHandler(data){
		if(!data.success)
			return;

		btnLeaveGame.disappear();

		(playerPawns.concat(opponentPawns)).forEach(function(pawn){
			createjs.Tween.removeTweens(pawn);
			pawn.scaleX = 1;
			pawn.scaleY = 1;

			var pawnAngle = Math.random()*(Math.PI*2);
			var destSin = Math.sin(pawnAngle) * Constants.DISAPPEARANCE_DIST;
			var destCos = Math.cos(pawnAngle) * Constants.DISAPPEARANCE_DIST;

			createjs.Tween.get(pawn).to({scaleX: 0, scaleY: 0, x: pawn.x + destSin, y: pawn.y + destCos}, 1500, createjs.Ease.circOut).call(function(){
				stage.removeChild(this);
			});
		});

		createjs.Tween.get(playerOneProfile).to({y: playerOneProfile.y - Constants.USER_PROFILE_MOVE, alpha: 0}, 500, createjs.Ease.backIn).call(function(){
			stage.removeChild(this);
		});

		createjs.Tween.get(playerTwoProfile).to({y: playerTwoProfile.y + Constants.USER_PROFILE_MOVE, alpha: 0}, 500, createjs.Ease.backIn).call(function(){
			stage.removeChild(this);
		});

		createjs.Tween.get(board).to({y: stage.canvas.height, alpha: 0.5}, 1000, createjs.Ease.bounceOut).call(function(){
			gameNameText.show();
			selARoomText.show();
			board.alpha = 0;
			displayAllRoomsAJAXCall();
		});
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