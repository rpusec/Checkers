/**
 * This class contains all of the AJAX call success handler 
 * functions used in the game portion of the application.  
 * @class
 * @author Roman Pusec
 * @namespace rpcheckers.game.ajax
 */
rpcheckers.game.ajax.AJAXSuccessHandler = {};

(function(){

	var	ns = rpcheckers.game.ajax.AJAXSuccessHandler
	,	GameAJAXCallIntervalHandler
	,	GameAJAXCallHandler
	,	BoardPawnFactory
	,	BoardLogic
        ,	BlockSelectabilityLogic
        ,	Constants;

	var	stage
	,	gameNameText
	,	selARoomText
	,	board
	,	btnLeaveGame
	,	wmSecondPlayer
	,	contGameRoom
	,	turnTimer
	,	gameStat
	,	playerOnePawns
	,	playerTwoPawns
	,	playerOneProfile
	,	playerTwoProfile;

	/**
	 * Initializes all of the properties used by all of the success handlers. 
	 * @param  {Object} props Represents parameters. 
	 *                        - {createjs.Stage} stage => The stage reference.
	 *                        - {AppearingText}  gameNameText => The game name text referece.
	 *                        - {AppearingText}  selARoomText => The select a room text reference. 
	 *                        - {Board}          board => The board reference. 
	 *                        - {Button}         btnLeaveGame => The leave game button reference. 
	 *                        - {WaitingMessage} wmSecondPlayer => The second player waiting message reference. 
	 *                        - {TurnTimer}      turnTimer => The turnTimer reference.  
	 */
	ns.initializeAllProperties = function(props){
		stage = props.stage;
		gameNameText = props.gameNameText;
		selARoomText = props.selARoomText;
		board = props.board;
		btnLeaveGame = props.btnLeaveGame;
		wmSecondPlayer = props.wmSecondPlayer;
		contGameRoom = new createjs.Container();
		turnTimer = props.turnTimer;

		var gameNS = rpcheckers.game;
		GameAJAXCallIntervalHandler = gameNS.ajax.AJAXCallIntervalHandler;
		GameAJAXCallHandler = gameNS.ajax.AJAXCallHandler;
		BoardPawnFactory = gameNS.factory.BoardPawnFactory;
		BoardLogic = gameNS.business.BoardLogic;
		BlockSelectabilityLogic = gameNS.business.BlockSelectabilityLogic;
                Constants = gameNS.config.Constants;
	}

	/**
	 * Returns all properties from this class wrapped up in a plain object. 
	 * @return {Object} All of the properties. 
	 */
	ns.getAllProperties = function(){
		return {
			stage: stage,
			gameNameText: gameNameText,
			selARoomText: selARoomText,
			board: board,
			btnLeaveGame: btnLeaveGame,
			wmSecondPlayer: wmSecondPlayer,
			contGameRoom: contGameRoom,
			turnTimer: turnTimer
		}
	}

	/**
	 * This function is executed if a specified AJAX request was handles successfully. 
	 * It returns the list of all available rooms from the backend and displays them 
	 * on the canvas.
	 * @param {Object} data A plain object which contains data from the backend. It includes a success flag, indicating 
	 *                      if the user's state is appropriate for this request, and the array of rooms. 
	 */
	ns.displayAllRoomsSuccessHandler = function(data){
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
					GameAJAXCallHandler.toGameRoomAJAXCall(this.getRoomID());
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
		GameAJAXCallIntervalHandler.setCheckRoomAvailabilityInterval();
	}

	/**
	 * Is executed when an appropriate AJAX request was executed successfully. 
	 * Displays the opponent's first name, last name, and username in the game. 
	 * It also removes the WaitingMessage which informs the player that they
	 * have to wait for their opponent. 
	 * @param  {Object} data Data from the server. 
	 */
	ns.checkForOpponentSuccessHandler = function(data){
		if(!data.success)
			return;

		if(data.opponent !== null)
		{
			playerTwoProfile.setID(data.opponent.userID);
			playerTwoProfile.setFirstname(data.opponent.firstname);
			playerTwoProfile.setLastname(data.opponent.lastname);
			playerTwoProfile.setUsername(data.opponent.username);
			createjs.Tween.get(playerTwoProfile).to({x: playerTwoProfile.x + Constants.USER_PROFILE_MOVE, alpha: 1}, 500, createjs.Ease.backOut);
			hideSecondPlayerWaitingMessage();
			GameAJAXCallIntervalHandler.clearCheckForOpponentInterval();
			GameAJAXCallHandler.whoseTurnAJAXCall(data.opponent.roomID);
			setupAndDisplayGameStat();
		}
	}

	/**
	 * Is executed when an appropriate AJAX request was executed successfully.
	 * Checks whose turn it is, and highlights the said player based on the information
	 * retrieved from the server. 
	 * The turn timer is displayed to the authenticated user IF it's their turn. 
	 * @param  {Object} data Data retrieved from the server. 
	 */
	ns.checkWhoseTurnSuccessHandler = function(data){
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
					BoardLogic.makePawnsSelectable(playerOnePawns);
					turnTimer.startTimer();
				}
				else
				{
					playerOneProfile.understate();
					playerTwoProfile.highlight();
					GameAJAXCallIntervalHandler.setCheckIfOpponentIsDoneInterval();
				}

				BoardLogic.setCurrentPawnList(playerOnePawns);
			}
			else if(data.playerNumber === Constants.SECOND_PLAYER)
			{
				if(data.whoseTurn === data.loggedUserID)
				{
					playerOneProfile.understate();
					playerTwoProfile.highlight();
					BoardLogic.makePawnsSelectable(playerTwoPawns);
					turnTimer.startTimer();
				}
				else
				{
					playerOneProfile.highlight();
					playerTwoProfile.understate();
					GameAJAXCallIntervalHandler.setCheckIfOpponentIsDoneInterval();
				}

				BoardLogic.setCurrentPawnList(playerTwoPawns);
			}
		}

		GameAJAXCallIntervalHandler.setCheckIfAPlayerLeftInterval()
	}

	/**
	 * Is executed when an appropriate AJAX call was handled successfully. 
	 * Marks game rooms as available or unavailable, depending on the amount
	 * of users that the rooms contain. 
	 * @param  {Object} data Data from the server. 
	 */
	ns.checkGameRoomAvailabilitySuccessHandler = function(data){
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
	ns.toGameRoomSuccessHandler = function(data){
		if(!data.success)
		{
			BootstrapDialog.show({
				type: BootstrapDialog.TYPE_DANGER,
				title: "Error",
				message: formatLineByLine(data.errors)
			});

			return;
		}

		GameAJAXCallIntervalHandler.clearCheckRoomAvailabilityInterval();

		//hiding the texts 
		gameNameText.hide();
		selARoomText.hide();

		//removing all of the mouse events from all 
		//of the GameRoom display objects 
		contGameRoom.children.forEach(function(gameRoom){
			gameRoom.removeMouseEvents();
		});

		//setting the GameRoom container below the canvas and setting its alpha to zero
		createjs.Tween.get(contGameRoom).to({y: stage.canvas.height, alpha: 0}, 1000).call(function(){

			contGameRoom.removeAllChildren();
			stage.removeChild(contGameRoom);

			//displaying the board to the center of the canvas 
			createjs.Tween.get(board).to({y: stage.canvas.height/2 - board.getBounds().height/2, alpha: 1}, 1000, createjs.Ease.backOut).call(function(){
				BoardPawnFactory.resetSides();
				var pawnInfo = createAndSetupPawns();
				btnLeaveGame.appear(null, function(){
					var playerOneProps = {
						side: UserGameProfile.RIGHT_SIDE, 
						avatar: pawnInfo.pOnePawns.avatar
					};

					var playerTwoProps = {
						side: UserGameProfile.LEFT_SIDE, 
						avatar: pawnInfo.pTwoPawns.avatar
					};

					//true if the user was the first one to enter a game room
					if(data.playerNumber === Constants.FIRST_PLAYER)
					{
						if(data.users[0].userID == data.loggedUserID)
						{
							playerOneProps.id = data.users[0].userID;
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
						//this computer, then they should be represented as the second player
						if(data.users[0].userID == data.loggedUserID)
						{
							playerOneProps.id = data.users[1].userID;
							playerOneProps.firstname = data.users[1].firstname;
							playerOneProps.lastname = data.users[1].lastname;
							playerOneProps.username = data.users[1].username;

							playerTwoProps.id = data.users[0].userID;
							playerTwoProps.firstname = data.users[0].firstname;
							playerTwoProps.lastname = data.users[0].lastname;
							playerTwoProps.username = data.users[0].username;
						}
						else if(data.users[1].userID == data.loggedUserID)
						{
							playerOneProps.id = data.users[0].userID;
							playerOneProps.firstname = data.users[0].firstname;
							playerOneProps.lastname = data.users[0].lastname;
							playerOneProps.username = data.users[0].username;

							playerTwoProps.id = data.users[1].userID;
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

					if(data.playerNumber === Constants.SECOND_PLAYER)
						createjs.Tween.get(playerTwoProfile).to({x: playerTwoProfile.x + Constants.USER_PROFILE_MOVE, alpha: 1}, 500, createjs.Ease.backOut);

					stage.addChild(playerOneProfile, playerTwoProfile);

					if(data.playerNumber === Constants.FIRST_PLAYER)
						GameAJAXCallIntervalHandler.setCheckForOpponentInterval();
					else if(data.playerNumber === Constants.SECOND_PLAYER)
					{
						setupAndDisplayGameStat();
						GameAJAXCallHandler.whoseTurnAJAXCall(data.roomID);
					}
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
	ns.offGameSuccessHandler = function(data){
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

		GameAJAXCallIntervalHandler.clearCheckForOpponentInterval();
		GameAJAXCallIntervalHandler.clearCheckIfOpponentIsDoneInterval();
		GameAJAXCallIntervalHandler.clearCheckIfAPlayerLeftInterval();

		createjs.Tween.get(board).to({y: stage.canvas.height, alpha: 0.5}, 1000, createjs.Ease.bounceOut).call(function(){
			BoardPawnFactory.resetSides();
			gameNameText.show();
			selARoomText.show();
			board.alpha = 0;	
			contGameRoom.alpha = 1;
			BlockSelectabilityLogic.makeBoardBlocksUnselectable();
			GameAJAXCallHandler.displayAllRoomsAJAXCall();
		});

		hideSecondPlayerWaitingMessage();
		turnTimer.endTimer();

		if(typeof gameStat !== 'undefined' && gameStat !== null)
		{
			createjs.Tween.get(gameStat).to({
				rotation: (Math.random() < 0.5 ? 1 : -1) * (Math.random()*Constants.GAME_STAT_MAX_ROTATION), 
				alpha: 0,
				scaleX: 0,
				scaleY: 0
			}, 1000, createjs.Ease.backIn).call(function(){
				if(this.parent !== null)
					this.parent.removeChild(this);

				gameStat = null;
			});
		}
	}

	/**
	 * Executes when an appropriate AJAX request was handled successfully. 
	 * If the current player's move was validated successfully on the backend, then 
	 * the game moves the pawn to the location that the player desired. 
	 * @param  {Object} data Data from the server. 
	 */
	ns.evaluatePlayerMoveSuccessHandler = function(data){
		if(!data.success)
		{
			BootstrapDialog.show({
				type: BootstrapDialog.TYPE_DANGER,
				title: "Error",
				message: data.error
			});

			if(data.hasOwnProperty('errorType') && data.errorType === 'turnDurationError')
				rpcheckers.dom.ajax.checkLoginStatusAJAXCall();

			return;
		}

		var targetPawn = null;
		var pcSplit = data.prevCoordinate.split(Constants.COORDINATE_DELIMITER);
		var prevCoordinate = new createjs.Point(parseInt(pcSplit[0]), parseInt(pcSplit[1]));
		data.playerNumber = parseInt(data.playerNumber);

		(data.playerNumber === Constants.FIRST_PLAYER ? playerOnePawns : playerTwoPawns).forEach(function(pawn){
			if(pawn.point.x === prevCoordinate.x && pawn.point.y === prevCoordinate.y)
			{
				targetPawn = pawn;
				return false;
			}
		});

		if(targetPawn !== null)
		{
			var ncSplit = data.newCoordinate.split(Constants.COORDINATE_DELIMITER);
			var newCoordinate = new createjs.Point(parseInt(ncSplit[0]), parseInt(ncSplit[1]));

			movePawn(targetPawn, newCoordinate, function(){
				if(playerOneProfile.isHighlighted())
				{
					playerOneProfile.understate();
					playerTwoProfile.highlight();
				}
				else if(playerTwoProfile.isHighlighted())
				{
					playerOneProfile.highlight();
					playerTwoProfile.understate();
				}

				var removedPawns = BlockSelectabilityLogic.findBoardPawnsByIds(data.removedPawns);
				if(removedPawns !== null)
					removePawnsFromBoard(removedPawns);

				if(data.winner !== null)
				{
					announceWinner(data.winner);
					createAndSetupPawns(data.playerNumber);
				}
			});

			BlockSelectabilityLogic.makeBoardBlocksUnselectable();
			BoardLogic.makePawnsUnselectable();
			GameAJAXCallIntervalHandler.setCheckIfOpponentIsDoneInterval();
		}
	}

	/**
	 * Executes when an appropriate AJAX request was handled successfully. 
	 * Highlights the player and understates the opponent, and also enables 
	 * the player to move the pawns. 
	 * @param  {Object} data Data from the server. 
	 */
	ns.checkIfOpponentIsDoneSuccessHandler = function(data){
		if(!data.success || !data.isDone)
			return;

		data.playerNumber = parseInt(data.playerNumber);

		if(playerOneProfile.isHighlighted())
		{
			playerOneProfile.understate();
			playerTwoProfile.highlight();
		}
		else if(playerTwoProfile.isHighlighted())
		{
			playerOneProfile.highlight();
			playerTwoProfile.understate();
		}

		if(data.lastMove !== null)
		{
			var lastMove = JSON.parse(data.lastMove);
			var targetPawn = BlockSelectabilityLogic.findBoardPawnsByCoordinates(data.playerNumber === Constants.FIRST_PLAYER ? Constants.SECOND_PLAYER : Constants.FIRST_PLAYER, new createjs.Point(lastMove.prevX, lastMove.prevY));

			movePawn(targetPawn, new createjs.Point(lastMove.newX, lastMove.newY), function(){
				var removedPawnsIds = JSON.parse(data.removedPawns);
				var removedPawns = BlockSelectabilityLogic.findBoardPawnsByIds(removedPawnsIds);
				
				if(removedPawns !== null)
					removePawnsFromBoard(removedPawns);

				if(data.winner !== null)
				{
					announceWinner(data.winner);
					createAndSetupPawns(data.playerNumber);
					BoardLogic.makePawnsSelectable();
				}
			});
		}

		if(data.winner === null)
			BoardLogic.makePawnsSelectable();

		GameAJAXCallIntervalHandler.clearCheckIfOpponentIsDoneInterval();
		turnTimer.startTimer();
	}

	/**
	 * Executes when an appropriate AJAX request was handled successfully. 
	 * Notifies the user that their opponent left and escorts them back to the
	 * list of game rooms. 
	 * @param  {Object} data Data from the server. 
	 */
	ns.checkIfAPlayerLeftSuccessHandler = function(data){
		if(!data.success || !data.shouldExitRoom)
			return;

		GameAJAXCallHandler.offGameRoomAJAXCall();

		BootstrapDialog.show({
			type: BootstrapDialog.TYPE_INFO,
			title: "Game status",
			message: 'Your opponent left the game. '
		});
	}

	/**
	 * Notifies the user that their timer ran out. 
	 * @param  {Object} data Data from the server. 
	 */
	ns.notifyTimeOutSuccessHandler = function(data){
		if(!data.success)
			return;

		if(playerOneProfile.isHighlighted())
		{
			playerOneProfile.understate();
			playerTwoProfile.highlight();
		}
		else if(playerTwoProfile.isHighlighted())
		{
			playerOneProfile.highlight();
			playerTwoProfile.understate();
		}

		turnTimer.endTimer();
		GameAJAXCallIntervalHandler.setCheckIfOpponentIsDoneInterval();

		BoardLogic.makePawnsUnselectable();
	}

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

	/**
	 * Removes a list of pawns from the board. 
	 * @param  {[Array<BoardPawn>|BoardPawn]} targetPawns The pawns to remove. Can be a single pawn or an array of Pawns. 
	 */
	function removePawnsFromBoard(targetPawns){
		if(!Array.isArray(targetPawns))
			targetPawns = [targetPawns];

		targetPawns.forEach(function(pawn){
			var targetPawnArray = pawn.getWhichPlayer() === Constants.FIRST_PLAYER ? playerOnePawns : playerTwoPawns;
			targetPawnArray.splice(targetPawnArray.indexOf(pawn), 1);
			pawn.killOff(stage, Constants.PAWN_KILL_OFF_ROTATION_AMOUNT, Constants.PAWN_KILL_OFF_DELAY);

			if(pawn.getWhichPlayer() === Constants.FIRST_PLAYER)
				gameStat.decrPlayerOnePawns();
			else if(pawn.getWhichPlayer() === Constants.SECOND_PLAYER)
				gameStat.decrPlayerTwoPawns();
		});
	}

	/**
	 * Creates and sets up the pawns in the game. 
	 * @param  {Integer} playerNumber The number of the player. 
	 * @return {Object}               All of the information provided by the BoardPawnFactory class. 
	 * @see  BoardPawnFactory.class.js
	 */
	function createAndSetupPawns(playerNumber){
		if(	typeof playerOnePawns !== 'undefined' && 
			typeof playerTwoPawns !== 'undefined' && 
			playerOnePawns !== null && 
			playerTwoPawns !== null)
		{
			(playerOnePawns.concat(playerTwoPawns)).forEach(function(pawn){
				pawn.killOff(stage, Constants.PAWN_KILL_OFF_ROTATION_AMOUNT, Constants.PAWN_KILL_OFF_DELAY);
			});
		}

		var pOnePawns = BoardPawnFactory.createPlayerOnePawns(board);
		var pTwoPawns = BoardPawnFactory.createPlayerTwoPawns(board);

		//spawns the player and opponent pawns 
		//and positiones them accordingly
		playerOnePawns = pOnePawns.list;
		playerTwoPawns = pTwoPawns.list;

		if(typeof playerNumber === 'number')
			BoardLogic.setCurrentPawnList(playerNumber === Constants.FIRST_PLAYER ? playerOnePawns : playerTwoPawns);

		BlockSelectabilityLogic.setPlayerOnePawns(playerOnePawns);
		BlockSelectabilityLogic.setPlayerTwoPawns(playerTwoPawns);

		//adding pawns to the game
		(playerOnePawns.concat(playerTwoPawns)).forEach(function(pawn, pawnIndex){
			pawn.scaleX = 0;
			pawn.scaleY = 0;
			createjs.Tween.get(pawn).to({scaleX: 1, scaleY: 1}, 1500, createjs.Ease.quartInOut);
			stage.addChild(pawn);
		});

		return {pOnePawns: pOnePawns, pTwoPawns: pTwoPawns};
	}

	/**
	 * Displays a message saying who won a round. 
	 * @param  {Integer} winnerPlayerNumber The player number of the winner. 
	 * @see  AppearingMessage.class.js
	 */
	function announceWinner(winnerPlayerNumber){
		var winnerName = '';

		if(winnerPlayerNumber === Constants.FIRST_PLAYER)
			winnerName = playerOneProfile.getFirstname() + ' ' + playerOneProfile.getLastname();
		else if(winnerPlayerNumber === Constants.SECOND_PLAYER)
			winnerName = playerTwoProfile.getFirstname() + ' ' + playerTwoProfile.getLastname();

		var amWinner = new AppearingMessage({
			text: 'The winner is ' + winnerName + '! ', 
			direction: Math.random() < 0.5 ? AppearingMessage.VERTICAL_DIRECTION : AppearingMessage.HORIZONTAL_DIRECTION
		});

		amWinner.x = stage.canvas.width/2;
		amWinner.y = stage.canvas.height/2;
		stage.addChild(amWinner);
		amWinner.appear();

		gameStat.resetPlayerOnePawns();
		gameStat.resetPlayerTwoPawns();
		gameStat.incrRound();
	}

	/**
	 * Creates and sets up the game state object (the display object which displays 
	 * the current state of the game (round, pawn amount, etc.).
	 */
	function setupAndDisplayGameStat(){
		gameStat = new GameStat({
			playerOneName: playerOneProfile.getFirstname(), 
			playerTwoName: playerTwoProfile.getFirstname()
		});

		gameStat.x = stage.canvas.width/2;
		gameStat.y = board.y;

		stage.addChildAt(gameStat, stage.getChildIndex(board));
		createjs.Tween.get(gameStat).to({y: gameStat.y - gameStat.getBounds().height*2}, 1000, createjs.Ease.circOut);
	}
}());