/**
 * Includes functions to create appropriate pawns for 
 * both player and player's opponent. 
 * @author Roman Pusec
 * @requires BoardPawn.class.js
 */
var BoardPawnFactory = {};

(function(){

	/**
	 * @see BoardPawn.class.js for clarification. 
	 */
	function getPlayerOnePawnOptions(){
		return {
			strokeStyle: 2,
			strokeColor: Constants.COLOR_ONE,
			bgColor: Constants.COLOR_TWO,
			radius: 10
		};
	}

	/**
	 * @see BoardPawn.class.js for clarification. 
	 */
	function getPlayerTwoPawnOptions(){
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
	 * Creates the pawn list for the first player. 
	 * @see Constants.js for the default amount value. 
	 * @param  {Integer} amount The amount of pawns to generate. 
	 * @return {Array}        	List of pawns specified for the player.  
	 */
	BoardPawnFactory.createPlayerOnePawns = function(board, amount){
		return createPawns(amount, getPlayerOnePawnOptions(), board, true);
	}

	/**
	 * Creates the pawn list for the second player. 
	 * @see Constants.js for the default amount value. 
	 * @param  {Integer} amount The amount of pawns to generate. 
	 * @return {Array}        	List of pawns specified for the player's opponent.  
	 */
	BoardPawnFactory.createPlayerTwoPawns = function(board, amount){
		return createPawns(amount, getPlayerTwoPawnOptions(), board, false);
	}

	/**
	 * Sets the sides variable back to null. 
	 * It's executed when the createPlayerOnePawns and createPlayerTwoPawns have already been
	 * used, since then the previous sides value doesn't have to be kept. 
	 */
	BoardPawnFactory.resetSides = function(){
		sides = null;
	}

	/**
	 * Generates a number of pawns. This function is used by 
	 * both createPlayerOnePawns() and createPlayerTwoPawns() 
	 * functions. 
	 * 
	 * @see Constants.js for the default amount value. 
	 * @see positionPawns() to understand the purpose of the 'board' and 'isPlayerOne' properties. 
	 * @see BoardPawn.class.js for the list of possible options for a pawn display object. 
	 * 
	 * @param  {Integer} amount        The amount of pawns to be specified. 
	 * @param  {Object} pawnOptions    Plain object which contains options for each pawn in the list. 
	 * @param  {Board} board           Board reference. 
	 * @param  {Boolean} isPlayerOne   Specifies whether the pawns belong to the player or to the opponent. 
	 * @return {Array}             	   An array of pawns. 
	 */
	function createPawns(amount, pawnOptions, board, isPlayerOne){
		if(typeof amount !== 'number')
			amount = Constants.PAWN_AMOUNT;

		if(sides === null)
			sides = Constants.POLIGON_POINT_TYPE[calcPolyPointTypeIndex()];
		else
		{
			var sidesIndex = calcPolyPointTypeIndex();

			//to ensure that player's and opponent's pawns are always different 
			//when it comes to the number of sides from both of them 
			if(sidesIndex === Constants.POLIGON_POINT_TYPE.indexOf(sides))
			{
				if(sidesIndex + 1 > Constants.POLIGON_POINT_TYPE.length-1)
					sidesIndex--;
				else if(sidesIndex - 1 < 0)
					sidesIndex++;
				else
				{
					if(Math.random() < 0.5)
						sidesIndex--;
					else
						sidesIndex++;
				}
			}

			sides = Constants.POLIGON_POINT_TYPE[sidesIndex];
		}
		
		pawnOptions.sides = sides;

		var pawnList = [];

		for(var i = 0; i < amount; i++)
			pawnList.push(new BoardPawn(pawnOptions));

		var avatarOptions = $.extend({}, pawnOptions, {
			radius: Constants.USER_PROFILE_AVATAR_SIZE
		});

		positionPawns(pawnList, board, isPlayerOne);

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
	 * first player or the second player to position them appropriately, since the 
	 * player's pawns are positioned from the top of the board whereas 
	 * the opponent's are positioned from below. 
	 * 
	 * @param  {Array}   arrPawn     The target array of pawns. 
	 * @param  {Board}   board       The board reference. 
	 * @param  {Boolean} isPlayerOne True if these pawns belong to the first player, false if they belong to the second one.  
	 */
	function positionPawns(arrPawn, board, isPlayerOne)
	{
		if(typeof isPlayerOne !== 'boolean')
			isPlayerOne = true;

		var playerTwoPosPawnsY = arrPawn.length/(board.getColAmount()/2);

		var posX = isPlayerOne ? 0 : 1;
		var posY = 0;
		arrPawn.forEach(function(pawn){
			pawn.x = board.x + board.getRectDimensions().width/2;
			pawn.y = board.y + (isPlayerOne ? board.getRectDimensions().height/2 : board.getBounds().height - board.getRectDimensions().height*playerTwoPosPawnsY + board.getRectDimensions().height/2);

			pawn.x += board.getRectDimensions().width * posX;
			pawn.y += board.getRectDimensions().height * posY;
			pawn.point = new createjs.Point(posX, posY + (!isPlayerOne ? board.getRowAmount() - playerTwoPosPawnsY : 0));

			posX += 2;

			if(((posY+1) % 2) === 0)
			{
				pawn.x -= board.getRectDimensions().width * (isPlayerOne ? -1 : 1);
				pawn.point.x -= (isPlayerOne ? -1 : 1);
			}

			if(posX >= board.getRowAmount())
			{
				posY++;
				posX = isPlayerOne ? 0 : 1;
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