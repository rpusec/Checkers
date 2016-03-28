/**
 * Handles all of the necessary functionalities relating to the canvas section of the application. 
 * @author Roman Pusec
 */
(function(){

	var 
	
	// stage reference
		stage

	//texts
	,	gameNameText
	,	selARoomText

	//board
	,	board
	
	//btns
	,	btnLeaveGame

	//pawns
	,	playerOnePawns
	,	playerTwoPawns
	,	currentlySelectedPawn = null

	//player profiles
	,	playerOneProfile
	,	playerTwoProfile

	//WaitingMessages
	,	wmSecondPlayer

	//interval references
	,	checkForOpponentInterval
	,	checkRoomAvailabilityInterval
	,	checkIfOpponentIsDoneInterval
	,	checkIfAPlayerLeftInterval

	//miscellaneous
	,	contGameRoom = new createjs.Container()
	,	gameInitialized = false;

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
			offGameRoomAJAXCall();
		});

		wmSecondPlayer = new WaitingMessage({text: 'Waiting for second player...'});

		btnLeaveGame.disappear(false);
		btnLeaveGame.x = Math.floor(btnLeaveGame.getBounds().width/2 + Constants.TEXT_PADDING);
		btnLeaveGame.y = Math.floor(btnLeaveGame.getBounds().height/2 + Constants.TEXT_PADDING);

		board = new Board();
		board.x = stage.canvas.width/2 - board.getBounds().width/2;
		board.y = stage.canvas.height;
		board.alpha = 0;

		BlockSelectabilityBusiness.setBoard(board);

		board.children.forEach(function(boardBlock){
			boardBlock.on('click', boardBlockClickHandler);
		});

		gameNameText.show();
		selARoomText.show();

		gameInitialized = true;
		stage.addChild(gameNameText, selARoomText, btnLeaveGame, board);
		displayAllRoomsAJAXCall();
	}

	/**
	 * Removes all children, tweens, 
	 * and events from the canvas. 
	 */
	window.uninitializeGame = function(){
		createjs.Tween.removeAllTweens();
		if(typeof stage !== 'undefined')
			stage.removeAllChildren();
		if(typeof contGameRoom !== 'undefined')
			contGameRoom.removeAllChildren();
		if(typeof stage !== 'undefined')
			stage.update();
		gameInitialized = false;
		clearInterval(checkRoomAvailabilityInterval);
		clearInterval(checkForOpponentInterval);
		clearInterval(checkIfOpponentIsDoneInterval);
		clearInterval(checkIfAPlayerLeftInterval);
	}

	//--------------------------------------------------------------------------------------------//
	//--------------------------------------------------------------------------------------------//
	//--------------------------------------------------------------------------------------------//
	//--------------------------------------------------------------------------------------------//
	//--------------------------------------------------------------------------------------------//
	//--------------------------------------------------------------------------------------------//
	//------- The following functions are responsible for executing various AJAX requests. -------//
	//--------------------------------------------------------------------------------------------//
	//--------------------------------------------------------------------------------------------//
	//--------------------------------------------------------------------------------------------//
	//--------------------------------------------------------------------------------------------//
	//--------------------------------------------------------------------------------------------//
	//--------------------------------------------------------------------------------------------//

	/**
	 * AJAX call which, when successfully executed, will escort the player to
	 * a game room of player's choice. 
	 */
	function toGameRoomAJAXCall(targetRoomID){
		runAjax({
			url: 'backend/view/RoomView.php',
			data:'path=add-to-game-room&gameRoomID=' + targetRoomID,
			success: toGameRoomSuccessHandler
		});
	}

	/**
	 * AJAX call which, when successfully executed, will return the player
	 * back to the list of game rooms. 
	 */
	function offGameRoomAJAXCall(){
		runAjax({
			url: 'backend/view/RoomView.php',
			data: 'path=remove-from-game-room',
			success: offGameSuccessHandler
		});
	}

	/**
	 * AJAX call which checks if a game room is available
	 * (that is, if the maximum amount of players has not
	 * been reached). 
	 */
	function checkGameRoomAvailabilityAJAXCall(){
		runAjax({
			url: 'backend/view/RoomView.php',
			data: 'path=check-room-availability',
			success: checkGameRoomAvailabilitySuccessHandler
		});
	}

	/**
	 * AJAX call which displays all game 
	 * rooms from the database.  
	 */
	function displayAllRoomsAJAXCall(){
		runAjax({
			url: 'backend/view/RoomView.php',
			data: 'path=get-all-rooms',
			success: displayAllRoomsSuccessHandler
		});
	}

	/**
	 * AJAX call which checks if a player's 
	 * opponent entered the game.  
	 */
	function checkForOpponentAJAXCall(){
		runAjax({
			url: 'backend/view/RoomView.php',
			data: 'path=check-for-opponent',
			success: checkForOpponentSuccessHandler
		});
	}

	/**
	 * AJAX Call which checks who's turn it is in the game. 
	 * @param  {Integer} targetRoomID The room in which the two players are. 
	 */
	function whoseTurnAJAXCall(targetRoomID){
		runAjax({
			url: 'backend/view/GameView.php',
			data: 'path=check-whose-turn&gameRoomID=' + targetRoomID,
			success: checkWhoseTurnSuccessHandler
		});
	}

	/**
	 * AJAX Call which evaluates the move the player made (that is, if 
	 * the move was valid and obeys the rules of the game). 
	 * @param  {Number} prevX             The initial X coordinate of the selected pawn. 
	 * @param  {Number} prevY             The initial Y coordinate of the selected pawn. 
	 * @param  {Number} newX              The new X coordinate of the selected pawn. 
	 * @param  {Number} newY              The new X coordinate of the selected pawn.  
	 */
	function evaluatePlayerMoveAJAXCall(prevX, prevY, newX, newY){
		runAjax({
			url: 'backend/view/GameView.php',
			data: 'path=evaluate-player-move&prevX=' + prevX + '&prevY=' + prevY + '&newX=' + newX + '&newY=' + newY,
			success: evaluatePlayerMoveSuccessHandler
		});
	}

	/**
	 * AJAX Call which checks if the player's 
	 * opponent made their move. 
	 */
	function checkIfOpponentIsDoneAJAXCall(){
		runAjax({
			url: 'backend/view/GameView.php',
			data: 'path=check-if-opponent-is-done',
			success: checkIfOpponentIsDoneSuccessHandler
		});
	}

	/**
	 * Checks whether the opponent left the game
	 */
	function checkIfAPlayerLeftAJAXCall(){
		runAjax({
			url: 'backend/view/GameView.php',
			data: 'path=check-if-a-player-left',
			success: checkIfAPlayerLeftSuccessHandler
		});
	}

	/**
	 * Runs an AJAX call. Includes default properties that are shared among
	 * all AJAX requests. 
	 * @param  {Object} options Represents parameters. 
	 * @see jQuery AJAX documentation for param clarifications. 
	 */
	function runAjax(options){
		$.ajax($.extend({
			type: 'get',
			processData: false,
			contentType: false,
			dataType: 'json',
			error: function(data){console.log(data);}
		}, options));
	}

	//-----------------------------------------------------------------------------------------------------//
	//-----------------------------------------------------------------------------------------------------//
	//-----------------------------------------------------------------------------------------------------//
	//-----------------------------------------------------------------------------------------------------//
	//-----------------------------------------------------------------------------------------------------//
	//-----------------------------------------------------------------------------------------------------//
	//------- The following functions are responsible for handling success callbacks of AJAX calls. -------//
	//-----------------------------------------------------------------------------------------------------//
	//-----------------------------------------------------------------------------------------------------//
	//-----------------------------------------------------------------------------------------------------//
	//-----------------------------------------------------------------------------------------------------//
	//-----------------------------------------------------------------------------------------------------//
	//-----------------------------------------------------------------------------------------------------//

	/**
	 * This function is executed if a specified AJAX request was handles successfully. 
	 * It returns the list of all available rooms from the backend and displays them 
	 * on the canvas.
	 * @param {Object} data A plain object which contains data from the backend. It includes a success flag, indicating 
	 *                      if the user's state is appropriate for this request, and the array of rooms. 
	 */
	function displayAllRoomsSuccessHandler(data)
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
					toGameRoomAJAXCall(this.getRoomID());
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

		checkRoomAvailabilityInterval = setInterval(function(){
			checkGameRoomAvailabilityAJAXCall();
		}, Constants.CHECK_ROOM_AVAILABILITY_INTERVAL_DURATION);
	}

	/**
	 * Is executed when an appropriate AJAX request was executed successfully. 
	 * Displays the opponent's first name, last name, and username in the game. 
	 * It also removes the WaitingMessage which informs the player that they
	 * have to wait for their opponent. 
	 * @param  {Object} data Data from the server. 
	 */
	function checkForOpponentSuccessHandler(data){
		if(!data.success)
			return;

		if(data.opponent !== null)
		{
			playerTwoProfile.setFirstname(data.opponent.firstname);
			playerTwoProfile.setLastname(data.opponent.lastname);
			playerTwoProfile.setUsername(data.opponent.username);
			hideSecondPlayerWaitingMessage();
			clearInterval(checkForOpponentInterval);
			whoseTurnAJAXCall(data.opponent.roomID);
		}
	}

	/**
	 * Is executed when an appropriate AJAX request was executed successfully.
	 * Checks whose turn it is, and highlights the said player based on the information
	 * retrieved from the server. 
	 * @param  {Object} data Data retrieved from the server. 
	 */
	function checkWhoseTurnSuccessHandler(data){
		if(!data.success)
			return;

		data.playerNumber = parseInt(data.playerNumber);
		data.loggedUserID = parseInt(data.loggedUserID);
		data.whoseTurn = data.whoseTurn !== null ? parseInt(data.whoseTurn) : null;

		if(data.whoseTurn !== null)
		{
			if(data.playerNumber === Constants.FIRST_PLAYER)
			{
				if(data.whoseTurn === data.loggedUserID)
				{
					playerOneProfile.highlight();
					playerTwoProfile.understate();
					playerOnePawns.forEach(function(targetPawn){
						makePawnSelectable(targetPawn);
					});
				}
				else
				{
					playerOneProfile.understate();
					playerTwoProfile.highlight();
					checkIfOpponentIsDoneInterval = setInterval(function(){
						checkIfOpponentIsDoneAJAXCall();
					}, Constants.CHECK_IF_OPPONENT_IS_DONE_INTERVAL_DURATION);
				}

				currentPawnList = playerOnePawns;
			}
			else if(data.playerNumber === Constants.SECOND_PLAYER)
			{
				if(data.whoseTurn === data.loggedUserID)
				{
					playerOneProfile.understate();
					playerTwoProfile.highlight();
					playerTwoPawns.forEach(function(targetPawn){
						makePawnSelectable(targetPawn);
					});
				}
				else
				{
					playerOneProfile.highlight();
					playerTwoProfile.understate();
					checkIfOpponentIsDoneInterval = setInterval(function(){
						checkIfOpponentIsDoneAJAXCall();
					}, Constants.CHECK_IF_OPPONENT_IS_DONE_INTERVAL_DURATION);
				}

				currentPawnList = playerTwoPawns;
			}
		}

		checkIfAPlayerLeftInterval = setInterval(function(){
			checkIfAPlayerLeftAJAXCall();
		}, Constants.CHECK_IF_A_PLAYER_LEFT_INTERVAL_DURATION);
	}

	/**
	 * Is executed when an appropriate AJAX call was handled successfully. 
	 * Marks game rooms as available or unavailable, depending on the amount
	 * of users that the rooms contain. 
	 * @param  {Object} data Data from the server. 
	 */
	function checkGameRoomAvailabilitySuccessHandler(data){
		if(!data.success)
			return;
		
		if(stage.contains(contGameRoom) && contGameRoom.numChildren !== 0)
		{
			data.rooms.forEach(function(roomInfo){
				contGameRoom.children.forEach(function(room){
					if(room.getRoomID() == roomInfo.targetRoomID)
					{
						room.setAsUnavailable(parseInt(roomInfo.userCount) === Constants.MAX_USERS_PER_ROOM);
						return false;
					}
				});
			});
		}
	}

	/**
	 * Executes when an appropriate AJAX request was handled successfully. 
	 * Displays the board, the player pawns, and the player profiles on the canvas. 
	 *
	 * If the user was the first one to enter a game room, then the message stating
	 * that they have to wait for the second player would show up. If there already
	 * was another user in a game room, then a message would not be displayed. 
	 *
	 * First player will always be displayed on top, whereas the second one will always
	 * be displayed from below. 
	 * 
	 * @param  {Object} data Data retrieved from the server. 
	 */
	function toGameRoomSuccessHandler(data){
		if(!data.success)
		{
			BootstrapDialog.show({
				type: BootstrapDialog.TYPE_DANGER,
				title: "Error",
				message: formatLineByLine(data.errors)
			});

			return;
		}

		clearInterval(checkRoomAvailabilityInterval);

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
				BoardPawnFactory.resetSides();
				var pOnePawns = BoardPawnFactory.createPlayerOnePawns(board);
				var pTwoPawns = BoardPawnFactory.createPlayerTwoPawns(board);

				btnLeaveGame.appear(null, function(){

					var playerOneProps = {
						side: UserGameProfile.RIGHT_SIDE, 
						avatar: pOnePawns.avatar
					};

					var playerTwoProps = {
						side: UserGameProfile.LEFT_SIDE, 
						avatar: pTwoPawns.avatar
					};

					//true if the user was the first one to enter a game room
					if(data.playerNumber === Constants.FIRST_PLAYER)
					{
						if(data.users[0].userID == data.loggedUserID)
						{
							playerOneProps.firstname = data.users[0].firstname;
							playerOneProps.lastname = data.users[0].lastname;
							playerOneProps.username = data.users[0].username;
						}

						wmSecondPlayer.alpha = 0;
						wmSecondPlayer.x = stage.canvas.width/2;
						wmSecondPlayer.y = stage.canvas.height/2 - Constants.WM_SP_TO_BOTTOM;

						//displays a message informing the user that they have to wait for the second player 
						createjs.Tween.get(wmSecondPlayer).to({y: wmSecondPlayer.y + Constants.WM_SP_TO_BOTTOM, alpha: 1}, 1000, createjs.Ease.backOut);
						stage.addChild(wmSecondPlayer);
					}

					//true if the user was the second one to enter a game room
					else if(data.playerNumber === Constants.SECOND_PLAYER)
					{
						//if the first user on the list is the one who's logged in from
						//this computer, then they should be represented as the second
						//player
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

					//displaying user profiles 
					createjs.Tween.get(playerOneProfile).to({x: playerOneProfile.x - Constants.USER_PROFILE_MOVE, alpha: 1}, 500, createjs.Ease.backOut);
					createjs.Tween.get(playerTwoProfile).to({x: playerTwoProfile.x + Constants.USER_PROFILE_MOVE, alpha: 1}, 500, createjs.Ease.backOut);

					stage.addChild(playerOneProfile, playerTwoProfile);

					if(data.playerNumber === Constants.FIRST_PLAYER)
					{
						checkForOpponentInterval = setInterval(function(){
							checkForOpponentAJAXCall();
						}, Constants.CHECK_OPPONENT_INTERVAL_DURATION);
					}
					else if(data.playerNumber === Constants.SECOND_PLAYER)
					{
						whoseTurnAJAXCall(data.roomID);
					}
				});
				
				//spawns the player and opponent pawns 
				//and positiones them accordingly
				playerOnePawns = pOnePawns.list;
				playerTwoPawns = pTwoPawns.list;

				BlockSelectabilityBusiness.setPlayerOnePawns(playerOnePawns);
				BlockSelectabilityBusiness.setPlayerTwoPawns(playerTwoPawns);

				(playerOnePawns.concat(playerTwoPawns)).forEach(function(pawn, pawnIndex){
					pawn.scaleX = 0;
					pawn.scaleY = 0;
					createjs.Tween.get(pawn).to({scaleX: 1, scaleY: 1}, 1500, createjs.Ease.quartInOut);
					stage.addChild(pawn);
				});
			});

		});
	}

	/**
	 * Executes when an appropriate AJAX request was handled successfully. 
	 * Hides the board, the player profiles, etc. and returns the user back
	 * to the list of available game rooms. 
	 * @param  {Object} data Data retrieved from the server. 
	 */
	function offGameSuccessHandler(data){
		if(!data.success)
			return;

		btnLeaveGame.disappear();

		(playerOnePawns.concat(playerTwoPawns)).forEach(function(pawn){
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

		clearInterval(checkForOpponentInterval);
		clearInterval(checkIfOpponentIsDoneInterval);
		clearInterval(checkIfAPlayerLeftInterval);

		createjs.Tween.get(board).to({y: stage.canvas.height, alpha: 0.5}, 1000, createjs.Ease.bounceOut).call(function(){
			gameNameText.show();
			selARoomText.show();
			board.alpha = 0;	
			contGameRoom.alpha = 1;
			displayAllRoomsAJAXCall();
		});

		hideSecondPlayerWaitingMessage();
	}

	/**
	 * Executes when an appropriate AJAX request was handled successfully. 
	 * If the current player's move was validated successfully on the backend, then 
	 * the game moves the pawn to the location that the player desired. 
	 * @param  {Object} data Data from the server. 
	 */
	function evaluatePlayerMoveSuccessHandler(data){

		if(!data.success)
		{
			console.log('error: ' + data.error);
			return;
		}

		var targetPawn = null;
		var pcSplit = data.prevCoordinate.split('|');
		var prevCoordinate = new createjs.Point(parseInt(pcSplit[0]), parseInt(pcSplit[1]));

		(parseInt(data.playerNumber) === Constants.FIRST_PLAYER ? playerOnePawns : playerTwoPawns).forEach(function(pawn){
			if(pawn.point.x === prevCoordinate.x && pawn.point.y === prevCoordinate.y)
			{
				targetPawn = pawn;
				return false;
			}
		});

		if(targetPawn !== null)
		{
			var ncSplit = data.newCoordinate.split('|');
			var newCoordinate = new createjs.Point(parseInt(ncSplit[0]), parseInt(ncSplit[1]));

			movePawn(targetPawn, newCoordinate, function(){
				if(data.playerNumber === Constants.FIRST_PLAYER)
				{
					playerOneProfile.understate();
					playerTwoProfile.highlight();
				}
				else if(data.playerNumber === Constants.SECOND_PLAYER)
				{
					playerOneProfile.highlight();
					playerTwoProfile.understate();
				}
			});

			BlockSelectabilityBusiness.makeBoardBlocksUnselectable();

			currentPawnList.forEach(function(pawn){
				makePawnUnselectable(pawn);
			});

			checkIfOpponentIsDoneInterval = setInterval(function(){
				checkIfOpponentIsDoneAJAXCall();
			}, Constants.CHECK_IF_OPPONENT_IS_DONE_INTERVAL_DURATION);
		}
	}

	/**
	 * Executes when an appropriate AJAX request was handled successfully. 
	 * Highlights the player and understates the opponent, and also enables 
	 * the player to move the pawns. 
	 * @param  {Object} data Data from the server. 
	 */
	function checkIfOpponentIsDoneSuccessHandler(data){
		if(!data.success || !data.isDone)
			return;

		data.playerNumber = parseInt(data.playerNumber);

		if(data.playerNumber === Constants.FIRST_PLAYER)
		{
			playerOneProfile.highlight();
			playerTwoProfile.understate();
		}
		else if(data.playerNumber === Constants.SECOND_PLAYER)
		{
			playerOneProfile.understate();
			playerTwoProfile.highlight();
		}

		var lastMove = JSON.parse(data.lastMove);
		var targetPawn = BlockSelectabilityBusiness.findBoardPawnByCoordinates(data.playerNumber === Constants.FIRST_PLAYER ? Constants.SECOND_PLAYER : Constants.FIRST_PLAYER, new createjs.Point(lastMove.prevX, lastMove.prevY));

		movePawn(targetPawn, new createjs.Point(lastMove.newX, lastMove.newY), function(){
			currentPawnList.forEach(function(pawn){
				makePawnSelectable(pawn);
			});
		});

		clearInterval(checkIfOpponentIsDoneInterval);
	}

	/**
	 * Executes when an appropriate AJAX request was handled successfully. 
	 * Notifies the user that their opponent left and escorts them back to the
	 * list of game rooms. 
	 * @param  {Object} data Data from the server. 
	 */
	function checkIfAPlayerLeftSuccessHandler(data){
		if(!data.success || !data.shouldExitRoom)
			return;

		offGameRoomAJAXCall();

		BootstrapDialog.show({
			type: BootstrapDialog.TYPE_INFO,
			title: "Game status",
			message: 'Your opponent left the game. '
		});
	}

	//----------------------------------------------------------------------------------//
	//----------------------------------------------------------------------------------//
	//----------------------------------------------------------------------------------//
	//----------------------------------------------------------------------------------//
	//----------------------------------------------------------------------------------//
	//----------------------------------------------------------------------------------//
	//------- The following functions are simply reusable throughout the script. -------//
	//----------------------------------------------------------------------------------//
	//----------------------------------------------------------------------------------//
	//----------------------------------------------------------------------------------//
	//----------------------------------------------------------------------------------//
	//----------------------------------------------------------------------------------//
	//----------------------------------------------------------------------------------//
	
	/**
	 * Hides the WaitingMessage object which informs the user that they 
	 * have to wait for their opponent. 
	 * @see  WaitingMessage.class.js for display object clarification. 
	 */
	function hideSecondPlayerWaitingMessage(){
		createjs.Tween.get(wmSecondPlayer).to({y: wmSecondPlayer.y - Constants.WM_SP_TO_BOTTOM, alpha: 0}, 1000, createjs.Ease.quadOut).call(function(){
			stage.removeChild(this);
		});
	}

	/**
	 * Moves a pawn to a particular location on the board. 
	 * @param  {BoardPawn} targetPawn           The target pawn to move. 
	 * @param  {createjs.Point} newCoordinate   The new location of the pawn. 
	 * @param  {Function} onCompleteFunct       Function which is executed once the pawn has been moved. 
	 */
	function movePawn(targetPawn, newCoordinate, onCompleteFunct){
		createjs.Tween.get(targetPawn).to({
			x: newCoordinate.x*board.getRectDimensions().width+board.x+board.getRectDimensions().width/2, 
			y: newCoordinate.y*board.getRectDimensions().height+board.y+board.getRectDimensions().height/2
		}, 500, createjs.Ease.circOut).call(onCompleteFunct);
		targetPawn.point = new createjs.Point(newCoordinate.x, newCoordinate.y);
	}

	//---------------------------------------------------------------------------------//
	//---------------------------------------------------------------------------------//
	//---------------------------------------------------------------------------------//
	//---------------------------------------------------------------------------------//
	//---------------------------------------------------------------------------------//
	//---------------------------------------------------------------------------------//
	//------- The following functions provide mouse interaction in the game. ----------//
	//---------------------------------------------------------------------------------//
	//---------------------------------------------------------------------------------//
	//---------------------------------------------------------------------------------//
	//---------------------------------------------------------------------------------//
	//---------------------------------------------------------------------------------//
	//---------------------------------------------------------------------------------//

	/**
	 * Makes a board pawn selectable (meaning that you can choose it and 
	 * move it around the canvas). 
	 * @param  {BoardPawn} targetPawn The target pawn. 
	 */
	function makePawnSelectable(targetPawn){
		targetPawn.highlight(true);
		targetPawn.removeAllEventListeners('click');			
		targetPawn.on('click', activateTargetPawnClickHandler);
	}

	/**
	 * Makes a board pawn selectable. 
	 * @param  {BoardPawn} targetPawn The target pawn. 
	 */
	function makePawnUnselectable(targetPawn){
		targetPawn.highlight(false);
		targetPawn.removeAllEventListeners('click');
		targetPawn.alpha = 1;
	}

	/**
	 * Handles the click event which is responsible for making a 
	 * pawn selectable. 
	 * @event click
	 */
	function activateTargetPawnClickHandler(){
		this.highlight(true);

		currentlySelectedPawn = this;
		var self = this;

		currentPawnList.forEach(function(targetPawn){
			if(self !== targetPawn)
			{
				targetPawn.highlight(false);
				targetPawn.alpha = 0.5;
				makePawnUnselectable(targetPawn);
			}
		});

		BlockSelectabilityBusiness.makeBoardBlocksSelectable(currentlySelectedPawn);
		this.off('click', activateTargetPawnClickHandler);
		this.on('click', deactivateTargetPawnClickHandler);
	}

	/**
	 * Handles the click event if we want to unselect 
	 * the target pawn that we first selected. 
	 * @event click
	 */
	function deactivateTargetPawnClickHandler(){
		currentlySelectedPawn = null;

		currentPawnList.forEach(function(targetPawn){
			targetPawn.highlight(true);
			targetPawn.alpha = 1;
			makePawnSelectable(targetPawn);
		});

		BlockSelectabilityBusiness.makeBoardBlocksUnselectable();
		this.off('click', deactivateTargetPawnClickHandler);
	}

	/**
	 * Handles the click event on the board (its children). Is executed only if we had already selected a particular 
	 * pawn and if we want to move it to a particular place on the board. 
	 * @event click
	 */
	function boardBlockClickHandler(){
		if(currentlySelectedPawn === null || !this.selectable)
			return;

		if(currentlySelectedPawn.point.x === this.point.x && currentlySelectedPawn.point.y === this.point.y)
			return;

		evaluatePlayerMoveAJAXCall(
			currentlySelectedPawn.point.x,
			currentlySelectedPawn.point.y,
			this.point.x,
			this.point.y);
	}

}());