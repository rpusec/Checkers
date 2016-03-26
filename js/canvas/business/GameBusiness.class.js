/**
 * [GameBusiness description]
 * @type {Object}
 */
var GameBusiness = {};

(function(){

	var board
	,	playerOnePawns
	,	playerTwoPawns
	,	targetBoardBlocks = [];

	var CFO_LEFT_UP = 0
	,	CFO_RIGHT_UP = 1
	,	CFO_LEFT_DOWN = 2
	,	CFO_RIGHT_DOWN = 3;

	GameBusiness.makeBoardBlockSelectable = function(currSelPawn){

		//coordinates of the currently selected pawn
		var pawnX = currSelPawn.point.x
		,	pawnY = currSelPawn.point.y;

		//target coordinates of the blocks that we want to highlight
		var coorLeftUp = createPointForLeftUp(pawnX, pawnY, 1)
		,	coorRightUp = createPointForRightUp(pawnX, pawnY, 1)
		,	coorLeftDown = createPointForLeftDown(pawnX, pawnY, 1)
		,	coorRightDown = createPointForRightDown(pawnX, pawnY, 1);

		checkForOpponent(coorLeftUp, currSelPawn.getWhichPlayer(), CFO_LEFT_UP);
		checkForOpponent(coorRightUp, currSelPawn.getWhichPlayer(), CFO_RIGHT_UP);
		checkForOpponent(coorLeftDown, currSelPawn.getWhichPlayer(), CFO_LEFT_DOWN);
		checkForOpponent(coorRightDown, currSelPawn.getWhichPlayer(), CFO_RIGHT_DOWN);
	}

	GameBusiness.makeBoardBlockUnselectable = function(){
		targetBoardBlocks.forEach(function(boardBlock){
			board.markBlockAsUnselectable(boardBlock);
		});

		while(targetBoardBlocks.length > 0)
			targetBoardBlocks.pop();	
	}

	GameBusiness.setBoard = function(_board){
		board = _board;
	}

	GameBusiness.setPlayerOnePawns = function(_playerOnePawns){
		playerOnePawns = _playerOnePawns;
	}

	GameBusiness.setPlayerTwoPawns = function(_playerTwoPawns){
		playerTwoPawns = _playerTwoPawns;
	}

	function findBoardBlockByCoordinates(){
		var arrResult = [];

		for(var i = 0; i < arguments.length; i++)
		{
			var targetCoor = arguments[i];

			board.children.forEach(function(boardBlock){
				if(boardBlock.hasOwnProperty('boardBorder') || typeof targetCoor === 'undefined' || targetCoor === null)
					return false;

				if(targetCoor.x === boardBlock.point.x && targetCoor.y === boardBlock.point.y){
					arrResult.push(boardBlock);
					return false;
				}
			});
		}

		if(arrResult.length > 0)
		{
			if(arrResult.length === 1)
				return arrResult[0];
			return arrResult;
		}

		return null;
	}

	function checkForOpponent(targetCoordinate, playerNumber, whichSide){

		if(typeof targetCoordinate === 'undefined' || targetCoordinate === null)
			return;

		switch(whichSide)
		{
			case CFO_LEFT_UP : 
				checkForOpponentCase(targetCoordinate, playerNumber, whichSide, createPointForLeftUp);
				break;
			case CFO_RIGHT_UP : 
				checkForOpponentCase(targetCoordinate, playerNumber, whichSide, createPointForRightUp);
				break;
			case CFO_LEFT_DOWN : 
				checkForOpponentCase(targetCoordinate, playerNumber, whichSide, createPointForLeftDown);
				break;
			case CFO_RIGHT_DOWN : 
				checkForOpponentCase(targetCoordinate, playerNumber, whichSide, createPointForRightDown);
				break;
		}

	}

	function checkForOpponentCase(targetCoordinate, playerNumber, whichSide, createPointForFunction){
		//the initial opponent pawn
		var initialOpponentPawn = findBoardPawnByCoordinates(playerNumber === Constants.FIRST_PLAYER ? Constants.SECOND_PLAYER : Constants.FIRST_PLAYER, targetCoordinate); 
		
		//if an opponent exists, look for another opponent
		if(initialOpponentPawn !== null)
		{
			var opCoorLeftUp = createPointForFunction(initialOpponentPawn.point.x, initialOpponentPawn.point.y, 2); //opponent pawn
			var ipCoorLeftUp = createPointForFunction(initialOpponentPawn.point.x, initialOpponentPawn.point.y, 1); //interference pawn

			//another opponent, and pawn between the initial opponent and target opponent (interference)
			var targetOpponentPawn = findBoardPawnByCoordinates(playerNumber === Constants.FIRST_PLAYER ? Constants.SECOND_PLAYER : Constants.FIRST_PLAYER, opCoorLeftUp);
			var interferencePawn = findBoardPawnByCoordinates(-1, ipCoorLeftUp);

			if(interferencePawn === null)
			{
				if(ipCoorLeftUp !== null)
				{
					var targetBlock = findBoardBlockByCoordinates(ipCoorLeftUp);
					if(targetBlock !== null)
					{
						board.markBlockAsSelectable(targetBlock);
						targetBoardBlocks.push(targetBlock);
					}
				}
			}
			
			//if the interference does not exist, and if the target opponent exists, search for another opponent
			if(targetOpponentPawn !== null && interferencePawn === null)
				checkForOpponent(opCoorLeftUp, playerNumber, whichSide);
		}
		else
		{
			//checking if there's a pawn that belongs to the player, if there isn't, that means that we can mark that spot as selectable 
			if(findBoardPawnByCoordinates(playerNumber, targetCoordinate) === null)
			{
				var targetBlock = findBoardBlockByCoordinates(targetCoordinate);
				if(targetBlock !== null)
				{
					board.markBlockAsSelectable(targetBlock);
					targetBoardBlocks.push(targetBlock);
				}
			}
		}
	}

	function findBoardPawnByCoordinates(playerNumber){

		var arrResult = [];

		for(var i = 1; i < arguments.length; i++)
		{
			var targetCoor = arguments[i];
			var targetArrPawn;

			if(typeof targetCoor === 'undefined' || targetCoor === null)
				continue;

			if(playerNumber === Constants.FIRST_PLAYER)
				targetArrPawn = playerOnePawns;
			else if(playerNumber === Constants.SECOND_PLAYER)
				targetArrPawn = playerTwoPawns;
			else
				targetArrPawn = playerOnePawns.concat(playerTwoPawns);

			(playerNumber === Constants.FIRST_PLAYER ? playerOnePawns : playerTwoPawns).forEach(function(pawn){
				if(targetCoor.x === pawn.point.x && targetCoor.y === pawn.point.y){
					arrResult.push(pawn);
					return false;
				}
			});
		}

		if(arrResult.length > 0)
		{
			if(arrResult.length === 1)
				return arrResult[0];
			return arrResult;
		}

		return null;
	}

	function createPointForLeftUp(pawnX, pawnY, offset){
		if(pawnX-offset >= 0 && pawnY-offset >= 0)
			return new createjs.Point(pawnX-offset, pawnY-offset);
		return null;
	}

	function createPointForRightUp(pawnX, pawnY, offset){
		if(pawnX+offset < board.getColAmount() && pawnY-offset >= 0)
			return new createjs.Point(pawnX+offset, pawnY-offset);
		return null;
	}

	function createPointForLeftDown(pawnX, pawnY, offset){
		if(pawnX-offset >= 0 && pawnY+offset < board.getRowAmount())
			return new createjs.Point(pawnX-offset, pawnY+offset);
		return null;
	}

	function createPointForRightDown(pawnX, pawnY, offset){
		if(pawnX+offset < board.getColAmount() && pawnY+offset < board.getRowAmount())
			return new createjs.Point(pawnX+offset, pawnY+offset);
		return null;
	}

}());