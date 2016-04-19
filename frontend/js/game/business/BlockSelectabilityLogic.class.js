/**
 * This class features all of the business operations relating to marking appropriate 
 * blocks (grids on the board) as selectable. When they're selectable, the player can 
 * move their pawn to that particular location. 
 * @class 
 * @author Roman Pusec
 * @requires {BoardPawn.class.js, Board.class.js}
 */
rpcheckers.game.business.BlockSelectabilityLogic = {};

(function(){

	var	ns = rpcheckers.game.business.BlockSelectabilityLogic
		Constants = rpcheckers.game.config.Constants;

	var board
	,	playerOnePawns
	,	playerTwoPawns
	,	targetBoardBlocks = [];

	var MBBSF_LEFT_UP = 0
	,	MBBSF_RIGHT_UP = 1
	,	MBBSF_LEFT_DOWN = 2
	,	MBBSF_RIGHT_DOWN = 3;

	/**
	 * Makes appropriate blocks or grids selectable, depending on the position
	 * of the pawn the player chose. 
	 * @param  {BoardPawn} currSelPawn The currently selected pawn. 
	 */
	ns.makeBoardBlocksSelectable = function(currSelPawn){
		makeBoardBlocksSelectableFrom(createPointForLeftUp(currSelPawn.point.x, currSelPawn.point.y, 1), currSelPawn.getWhichPlayer(), MBBSF_LEFT_UP);
		makeBoardBlocksSelectableFrom(createPointForRightUp(currSelPawn.point.x, currSelPawn.point.y, 1), currSelPawn.getWhichPlayer(), MBBSF_RIGHT_UP);
		makeBoardBlocksSelectableFrom(createPointForLeftDown(currSelPawn.point.x, currSelPawn.point.y, 1), currSelPawn.getWhichPlayer(), MBBSF_LEFT_DOWN);
		makeBoardBlocksSelectableFrom(createPointForRightDown(currSelPawn.point.x, currSelPawn.point.y, 1), currSelPawn.getWhichPlayer(), MBBSF_RIGHT_DOWN);
	}

	/**
	 * Unselects all board blocks that had 
	 * been marked as selectable. 
	 */
	ns.makeBoardBlocksUnselectable = function(){
		targetBoardBlocks.forEach(function(boardBlock){
			board.markBlockAsUnselectable(boardBlock);
		});

		while(targetBoardBlocks.length > 0)
			targetBoardBlocks.pop();	
	}

	/**
	 * Setting the board reference. 
	 * @param {Board} _board The board reference. 
	 */
	ns.setBoard = function(_board){
		board = _board;
	}

	/**
	 * Setting player one pawns. 
	 * @param {Array<BoardPawn>} _playerOnePawns The player one pawns. 
	 */
	ns.setPlayerOnePawns = function(_playerOnePawns){
		playerOnePawns = _playerOnePawns;
	}

	/**
	 * Setting player two pawns. 
	 * @param {Array<BoardPawn>} _playerTwoPawns The player two pawns. 
	 */
	ns.setPlayerTwoPawns = function(_playerTwoPawns){
		playerTwoPawns = _playerTwoPawns;
	}

	/**
	 * Finds board blocks based on the passed coordinates. 
	 * @param {...<createjs.Point>} points The coordinates of the board blocks that we want to fetch. 
	 * @return {Array|createjs.Shape(board block)|null} Either returns an array of board blocks, or a single board block 
	 *                                                  if there's only one element in the array, or null if the array is empty. 
	 */
	ns.findBoardBlockByCoordinates = function(){
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

		return emitSingleElementOrFullList(arrResult);
	}

	/**
	 * Makes board blocks selectable from a particular diagonal direction.  
	 * @param  {createjs.Point} targetCoordinate The coordinate of the beginning opponent pawn. 
	 * @param  {Integer} playerNumber            The player number (e.g. either Constants.FIRST_PLAYER or Constants.SECOND_PLAYER). 
	 * @param  {Integer} whichSide               Represents the side from which to look. See the appropriate constants above. 
	 */
	function makeBoardBlocksSelectableFrom(targetCoordinate, playerNumber, whichSide){

		if(typeof targetCoordinate === 'undefined' || targetCoordinate === null)
			return;

		switch(whichSide)
		{
			case MBBSF_LEFT_UP : 
				makeBoardBlocksSelectableFromCase(targetCoordinate, playerNumber, whichSide, createPointForLeftUp);
				break;
			case MBBSF_RIGHT_UP : 
				makeBoardBlocksSelectableFromCase(targetCoordinate, playerNumber, whichSide, createPointForRightUp);
				break;
			case MBBSF_LEFT_DOWN : 
				makeBoardBlocksSelectableFromCase(targetCoordinate, playerNumber, whichSide, createPointForLeftDown);
				break;
			case MBBSF_RIGHT_DOWN : 
				makeBoardBlocksSelectableFromCase(targetCoordinate, playerNumber, whichSide, createPointForRightDown);
				break;
		}

	}

	/**
	 * Represents a fragment of the makeBoardBlocksSelectableFrom() method, that is, one 'case'. 
	 * The function checks for further opponent pawns and also marks appropriate board blocks as selectable.
	 * @param  {createjs.Point} targetCoordinate       @see makeBoardBlocksSelectableFrom() for clarification. 
	 * @param  {Integer} playerNumber                  @see makeBoardBlocksSelectableFrom() for clarification. 
	 * @param  {Integer} whichSide                     @see makeBoardBlocksSelectableFrom() for clarification. 
	 * @param  {Function} createPointForFunction       Function which represents a createjs.Point that points to a diagonal direction relative from the initial opponent pawn. 
	 *                                                 The functions that can be used are as follows: 
	 *                                                 - {createPointForLeftUp}
	 *                                                 - {createPointForRightUp} 
	 *                                                 - {createPointForLeftDown} 
	 *                                                 - {createPointForRightDown} 
	 */
	function makeBoardBlocksSelectableFromCase(targetCoordinate, playerNumber, whichSide, createPointForFunction){
		//the initial opponent pawn
		var initialOpponentPawn = ns.findBoardPawnsByCoordinates(playerNumber === Constants.FIRST_PLAYER ? Constants.SECOND_PLAYER : Constants.FIRST_PLAYER, targetCoordinate); 
		
		//if an opponent exists, look for another opponent
		if(initialOpponentPawn !== null)
		{
			var opCoorLeftUp = createPointForFunction(initialOpponentPawn.point.x, initialOpponentPawn.point.y, 2); //opponent pawn
			var ipCoorLeftUp = createPointForFunction(initialOpponentPawn.point.x, initialOpponentPawn.point.y, 1); //interference pawn

			//another opponent, and pawn between the initial opponent and target opponent (interference)
			var targetOpponentPawn = ns.findBoardPawnsByCoordinates(playerNumber === Constants.FIRST_PLAYER ? Constants.SECOND_PLAYER : Constants.FIRST_PLAYER, opCoorLeftUp);
			var interferencePawn = ns.findBoardPawnsByCoordinates(-1, ipCoorLeftUp);

			if(interferencePawn === null)
			{
				if(ipCoorLeftUp !== null)
				{
					var targetBlock = ns.findBoardBlockByCoordinates(ipCoorLeftUp);
					if(targetBlock !== null)
					{
						board.markBlockAsSelectable(targetBlock);
						targetBoardBlocks.push(targetBlock);
					}
				}
			}

			//if the interference does not exist, and if the target opponent exists, search for another opponent
			if(targetOpponentPawn !== null && interferencePawn === null)
				makeBoardBlocksSelectableFrom(opCoorLeftUp, playerNumber, whichSide);
		}
		else
		{
			//checking if there's a pawn that belongs to the player, if there isn't, that means that we can mark that spot as selectable 
			if(ns.findBoardPawnsByCoordinates(playerNumber, targetCoordinate) === null)
			{
				var targetBlock = ns.findBoardBlockByCoordinates(targetCoordinate);
				if(targetBlock !== null)
				{
					board.markBlockAsSelectable(targetBlock);
					targetBoardBlocks.push(targetBlock);
				}
			}
		}
	}

	/**
	 * Returns boards pawns by their ID values. 
	 * @param {...<createjs.Point>} ids The ID values of the target pawns. 
	 * @return {Array|BoardPawn|null} Either returns an array of pawns, or a single pawn if there's 
	 *                                only one element in the array, or null if the array is empty.
	 */
	ns.findBoardPawnsByIds = function(){
		if(arguments.length === 0)
			return null;

		if(Array.isArray(arguments[0]))
			arguments = arguments[0];

		var selectedBoardPawns = [];

		for(var i = 0; i < arguments.length; i++)
		{
			var targetId = arguments[i];

			playerOnePawns.concat(playerTwoPawns).forEach(function(pawn){
				if(targetId === pawn.getID())
				{
					selectedBoardPawns.push(pawn);
					return false;
				}
			});
		}

		return emitSingleElementOrFullList(selectedBoardPawns);
	}

	/**
	 * Finds pawns based on the passed coordinates. 
	 * @param {Integer}             playerNumber Represents the player number (e.g. either Constants.FIRST_PLAYER or Constants.SECOND_PLAYER). 
	 * @param {...<createjs.Point>} points       The coordinates of the pawns that we want to fetch. 
	 * @return {Array|BoardPawn|null} Either returns an array of pawns, or a single pawn if there's 
	 *                                only one element in the array, or null if the array is empty. 
	 */
	ns.findBoardPawnsByCoordinates = function(playerNumber){

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

			targetArrPawn.forEach(function(pawn){
				if(targetCoor.x === pawn.point.x && targetCoor.y === pawn.point.y){
					arrResult.push(pawn);
					return false;
				}
			});
		}

		return emitSingleElementOrFullList(arrResult);
	}

	/**
	 * Returns a single element from the specified array (if there's only 
	 * one element), otherwise it either returns null or the full array. 
	 * @param  {Array} targetArray      The target array. 
	 * @return {Array|AnyObject|null}   Either an array, a single element from the array, or null.  
	 */
	function emitSingleElementOrFullList(targetArray){
		if(targetArray.length > 0)
		{
			if(targetArray.length === 1)
				return targetArray[0];
			return targetArray;
		}

		return null;
	}

	/**
	 * Creates a new point relative to the provided point (based on pawnX and pawnY properties).  
	 * @param  {Number} pawnX  X axis. 
	 * @param  {Number} pawnY  Y axis. 
	 * @param  {Number} offset The difference (or space) between the initial coordinate and the new coordinate. 
	 */
	function createPointForLeftUp(pawnX, pawnY, offset){
		if(pawnX-offset >= 0 && pawnY-offset >= 0)
			return new createjs.Point(pawnX-offset, pawnY-offset);
		return null;
	}

	/**
	 * Creates a new point relative to the provided point (based on pawnX and pawnY properties).  
	 * @param  {Number} pawnX  X axis. 
	 * @param  {Number} pawnY  Y axis. 
	 * @param  {Number} offset The difference (or space) between the initial coordinate and the new coordinate. 
	 */
	function createPointForRightUp(pawnX, pawnY, offset){
		if(pawnX+offset < board.getColAmount() && pawnY-offset >= 0)
			return new createjs.Point(pawnX+offset, pawnY-offset);
		return null;
	}

	/**
	 * Creates a new point relative to the provided point (based on pawnX and pawnY properties).  
	 * @param  {Number} pawnX  X axis. 
	 * @param  {Number} pawnY  Y axis. 
	 * @param  {Number} offset The difference (or space) between the initial coordinate and the new coordinate. 
	 */
	function createPointForLeftDown(pawnX, pawnY, offset){
		if(pawnX-offset >= 0 && pawnY+offset < board.getRowAmount())
			return new createjs.Point(pawnX-offset, pawnY+offset);
		return null;
	}

	/**
	 * Creates a new point relative to the provided point (based on pawnX and pawnY properties).  
	 * @param  {Number} pawnX  X axis. 
	 * @param  {Number} pawnY  Y axis. 
	 * @param  {Number} offset The difference (or space) between the initial coordinate and the new coordinate. 
	 */
	function createPointForRightDown(pawnX, pawnY, offset){
		if(pawnX+offset < board.getColAmount() && pawnY+offset < board.getRowAmount())
			return new createjs.Point(pawnX+offset, pawnY+offset);
		return null;
	}

}());