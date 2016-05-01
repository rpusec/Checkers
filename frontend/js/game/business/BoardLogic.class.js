/**
 * Offers the logic behind making pawns selectable (e.g. that the player can 
 * chose a pawn to move), or unselectable and that the pawn can be moved to a 
 * particular location. 
 * @class
 * @author Roman Pusec
 * @requires {BoardPawn.class.js, Board.class.js}
 */
rpcheckers.game.business.BoardLogic = {};

(function(){

	var	ns = rpcheckers.game.business.BoardLogic
	,	AJAXCallHandler
	,	ParticleFactory
	,	BlockSelectabilityLogic;

	var	board
	,	currentPawnList
	,	turnTimer;

	ns.initialize = function(){
		AJAXCallHandler = rpcheckers.game.ajax.AJAXCallHandler;
		ParticleFactory = rpcheckers.game.factory.ParticleFactory;
		BlockSelectabilityLogic = rpcheckers.game.business.BlockSelectabilityLogic;
	}

	/**
	 * Sets the board. 
	 * @param {Board} _board The board. 
	 */
	ns.setBoard = function(_board){
		board = _board;

		board.children.forEach(function(boardBlock){
			boardBlock.on('click', boardBlockClickHandler);
		});
	}

	/**
	 * Sets the player's pawn list. Note that the player's and the 
	 * opponent's pawn lists are separated lists of pawns. 
	 * @param {Array<BoardPawn>} _currentPawnList The player's pawn list. 
	 */
	ns.setCurrentPawnList = function(_currentPawnList){
		currentPawnList = _currentPawnList;
	}

	/**
	 * Sets the turn timer. 
	 * @param {TurnTimer} _turnTimer The turn timer. 
	 */
	ns.setTurnTimer = function(_turnTimer){
		turnTimer = _turnTimer;
	}

	/**
	 * Makes the pawns selectable. 
	 * @param  {Array<BoardPawn>} arrPawns The target array of pawns, if not specified, the currentPawnList will be used. 
	 */
	ns.makePawnsSelectable = function(arrPawns, pawnsToIgnore){
		if(!Array.isArray(arrPawns))
			arrPawns = currentPawnList;

		if(!Array.isArray(pawnsToIgnore))
			if(typeof pawnsToIgnore === 'object' && pawnsToIgnore !== null && pawnsToIgnore.__proto__.constructor.name === 'BoardPawn')
				pawnsToIgnore = [pawnsToIgnore];
			else
				pawnsToIgnore = null;

		arrPawns.forEach(function(pawn){
			if(pawnsToIgnore !== null)
			{
				var makeSelectable = true;

				pawnsToIgnore.forEach(function(ignoredPawn){
					if(ignoredPawn.getID() === pawn.getID())
					{
						makeSelectable = false;
						return false;
					}
				});

				if(makeSelectable)
					makePawnSelectable(pawn);
			}
			else
				makePawnSelectable(pawn);
		});
	}

	/**
	 * Makes the pawns unselectable. 
	 * @param  {Array<BoardPawn>} arrPawns The target array of pawns, if not specified, the currentPawnList will be used. 
	 */
	ns.makePawnsUnselectable = function(arrPawns){
		if(!Array.isArray(arrPawns))
			arrPawns = currentPawnList;
		
		arrPawns.forEach(function(pawn){
			makePawnUnselectable(pawn);
		});
	}

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

		BlockSelectabilityLogic.makeBoardBlocksSelectable(currentlySelectedPawn);
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

		BlockSelectabilityLogic.makeBoardBlocksUnselectable();
		this.off('click', deactivateTargetPawnClickHandler);
	}

	/**
	 * Handles the click event on the board (its children). Is executed only if we had already selected a particular 
	 * pawn and if we want to move it to a particular place on the board. 
	 * @event click
	 */
	function boardBlockClickHandler(evt){
		if(currentlySelectedPawn === null || !this.selectable)
			return;

		if(currentlySelectedPawn.point.x === this.point.x && currentlySelectedPawn.point.y === this.point.y)
			return;

		turnTimer.endTimer();
		ParticleFactory.spawnParticles(new createjs.Point(evt.stageX, evt.stageY));
		BlockSelectabilityLogic.makeBoardBlocksUnselectable();

		AJAXCallHandler.evaluatePlayerMoveAJAXCall(
			currentlySelectedPawn.point.x,
			currentlySelectedPawn.point.y,
			this.point.x,
			this.point.y);
	}

}());