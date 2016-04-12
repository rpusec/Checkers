var BoardBusiness = {};

(function(){

	var	board
	,	currentPawnList;

	BoardBusiness.setBoard = function(_board){
		board = _board;

		board.children.forEach(function(boardBlock){
			boardBlock.on('click', boardBlockClickHandler);
		});
	}

	BoardBusiness.setCurrentPawnList = function(_currentPawnList){
		currentPawnList = _currentPawnList;
	}

	BoardBusiness.makePawnsSelectable = function(arrPawns){
		if(!Array.isArray(arrPawns))
			arrPawns = currentPawnList;

		arrPawns.forEach(function(pawn){
			makePawnSelectable(pawn);
		});
	}

	BoardBusiness.makePawnsUnselectable = function(arrPawns){
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
	function boardBlockClickHandler(evt){
		if(currentlySelectedPawn === null || !this.selectable)
			return;

		if(currentlySelectedPawn.point.x === this.point.x && currentlySelectedPawn.point.y === this.point.y)
			return;

		turnTimer.endTimer();
		ParticleFactory.spawnParticles(new createjs.Point(evt.stageX, evt.stageY));

		AJAXCalls.evaluatePlayerMoveAJAXCall(
			currentlySelectedPawn.point.x,
			currentlySelectedPawn.point.y,
			this.point.x,
			this.point.y);
	}

}());