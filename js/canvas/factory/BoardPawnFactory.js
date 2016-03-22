/**
 * Includes functions to create appropriate pawns for 
 * both player and player's opponent. 
 * @author Roman Pusec
 * @requires BoardPawn.class.js
 */
var BoardPawnFactory = {};

(function(){

	function getPlayerPawnOptions(){
		return {
			strokeStyle: 2,
			strokeColor: Constants.COLOR_ONE,
			bgColor: Constants.COLOR_TWO,
			radius: 10
		};
	}

	function getOpponentPawnOptions(){
		return {
			strokeStyle: 2,
			strokeColor: Constants.COLOR_TWO,
			bgColor: Constants.COLOR_ONE,
			radius: 10
		};
	}

	/**
	 * Represents the amount of 'sides' for a polygon-shaped pawn. 
	 * @see  Easeljs documentation for Graphics.drawPolyStar() function. 
	 * @type {Integer}
	 */
	var sides = null;

	/**
	 * Creates the pawn list for the player. 
	 * @see Constants.js for the default amount value. 
	 * @param  {Integer} amount The amount of pawns to generate. 
	 * @return {Array}        	List of pawns specified for the player.  
	 */
	BoardPawnFactory.createPlayerPawns = function(board, amount){
		return createPawns(amount, getPlayerPawnOptions(), board, true);
	}

	/**
	 * Creates the pawn list for the player's opponent. 
	 * @see Constants.js for the default amount value. 
	 * @param  {Integer} amount The amount of pawns to generate. 
	 * @return {Array}        	List of pawns specified for the player's opponent.  
	 */
	BoardPawnFactory.createOpponentPawns = function(board, amount){
		return createPawns(amount, getOpponentPawnOptions(), board, false);
	}

	/**
	 * Sets the sides variable back to null. 
	 * It's executed when the createPlayerPawnList and createOpponentPawnList have already been
	 * used, since then the previous sides value doesn't have to be kept. 
	 */
	BoardPawnFactory.resetSides = function(){
		sides = null;
	}

	/**
	 * Generates a number of pawns. This function is used by 
	 * both createOpponentPawnList() and createPlayerPawnList() 
	 * functions. 
	 * 
	 * @see Constants.js for the default amount value. 
	 * @see positionPawns() to understand the purpose of the 'board' and 'isPlayer' properties. 
	 * @see BoardPawn.class.js for the list of possible options for a pawn display object. 
	 * 
	 * @param  {Integer} amount     The amount of pawns to be specified. 
	 * @param  {Object} pawnOptions Plain object which contains options for each pawn in the list. 
	 * @param  {Board} board        Board reference. 
	 * @param  {Boolean} isPlayer   Specifies whether the pawns belong to the player or to the opponent. 
	 * @return {Array}             	An array of pawns. 
	 */
	function createPawns(amount, pawnOptions, board, isPlayer){
		if(typeof amount !== 'number')
			amount = Constants.PAWN_AMOUNT;

		if(sides === null)
			sides = Constants.POLIGON_POINT_TYPE[calcPolyPointTypeIndex()];
		else
		{
			var newSides = calcPolyPointTypeIndex();

			//to ensure that player's and opponent's pawns are always different 
			//when it comes to the number of sides from both of them 
			if(newSides === Constants.POLIGON_POINT_TYPE.indexOf(sides))
			{
				if(newSides + 1 > Constants.POLIGON_POINT_TYPE.length-1)
					newSides--;
				else if(newSides - 1 < 0)
					newSides++;
				else
				{
					if(Math.random() < 0.5)
						newSides--;
					else
						newSides++;
				}
			}

			sides = Constants.POLIGON_POINT_TYPE[newSides];
		}
		
		pawnOptions.sides = sides;

		var pawnList = [];

		for(var i = 0; i < amount; i++)
			pawnList.push(new BoardPawn(pawnOptions));

		var avatarOptions = $.extend({}, pawnOptions, {
			radius: Constants.USER_PROFILE_AVATAR_SIZE
		});

		positionPawns(pawnList, board, isPlayer);

		return {list: pawnList, avatar: new BoardPawn(avatarOptions)};
	}

	/**
	 * Positions all of the pawns the way they're meant to be positioned 
	 * as in an actual game of checkers. 
	 * 
	 * Board is also referenced since the pawns have to have something to
	 * reference their X and Y positions in the game. 
	 *
	 * The function also has to know whether the pawns belong to the 
	 * player or the opponent to position them appropriately, since the 
	 * player's pawns are positioned from the top of the board whereas 
	 * the opponent's are positioned from below. 
	 * 
	 * @param  {Array}   arrPawn  The target array of pawns. 
	 * @param  {Board}   board    The board reference. 
	 * @param  {Boolean} isPlayer Do these pawns belong to the player, and not the opponent. 
	 */
	function positionPawns(arrPawn, board, isPlayer)
	{
		if(typeof isPlayer !== 'boolean')
			isPlayer = true;

		var posX = isPlayer ? 0 : 1;
		var posY = 0;
		arrPawn.forEach(function(pawn){
			pawn.x = board.x + board.getRectDimensions().width/2;
			pawn.y = board.y + (isPlayer ? board.getRectDimensions().height/2 : board.getBounds().height - board.getRectDimensions().height*3 + board.getRectDimensions().height/2);

			pawn.x += board.getRectDimensions().width * posX;
			pawn.y += board.getRectDimensions().height * posY;

			posX += 2;

			if(((posY+1) % 2) === 0)
				pawn.x -= board.getRectDimensions().width * (isPlayer ? -1 : 1);

			if(posX >= board.getRowAmount())
			{
				posY++;
				posX = isPlayer ? 0 : 1;
			}
		});
	}

	/**
	 * Calculates a new randomized value for polygon-shaped pawn sides. 
	 * @see Constants.js for minimum or maxumum polygon point size. 
	 * @return {Integer} A new randomized amount of polygon sides. 
	 */
	function calcPolyPointTypeIndex(){
		var poliPoinType = Constants.POLIGON_POINT_TYPE;
		return Math.floor(Math.random()*poliPoinType.length);
	}

}());