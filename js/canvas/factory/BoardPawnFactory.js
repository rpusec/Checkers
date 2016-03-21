/**
 * Includes functions to create appropriate pawns for the board. 
 * @author Roman Pusec
 * @requires BoardPawn.class.js
 */
var BoardPawnFactory = {};

(function(){

	var playerPawnOptions = {
		strokeStyle: 2,
		strokeColor: Constants.oddColor,
		bgColor: Constants.evenColor,
		radius: 10
	};

	var opponentPawnOptions = {
		strokeStyle: 2,
		strokeColor: Constants.evenColor,
		bgColor: Constants.oddColor,
		radius: 10
	};

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
	BoardPawnFactory.createPlayerPawnList = function(amount){
		return createPawnList(amount, playerPawnOptions);
	}

	/**
	 * Creates the pawn list for the player's opponent. 
	 * @see Constants.js for the default amount value. 
	 * @param  {Integer} amount The amount of pawns to generate. 
	 * @return {Array}        	List of pawns specified for the player's opponent.  
	 */
	BoardPawnFactory.createOpponentPawnList = function(amount){
		return createPawnList(amount, opponentPawnOptions);
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
	 * @see Constants.js for the default amount value. 
	 * @see BoardPawn.class.js for the list of possible options for a pawn display object. 
	 * @param  {Integer} amount     The amount of pawns to be specified. 
	 * @param  {Object} pawnOptions Plain object which contains options for each pawn in the list.  
	 * @return {Array}             	An array of pawns. 
	 */
	function createPawnList(amount, pawnOptions){
		if(typeof amount !== 'number')
			amount = Constants.PAWN_AMOUNT;

		if(sides === null)
			sides = calcSides();
		else
		{
			var newSides = calcSides();

			//to ensure that player's and opponent's
			//pawns are always different when it comes
			//to the number of sides from both of them 
			if(newSides === sides)
			{
				if(newSides + 1 > Constants.MAX_POLIGON_POINT_SIZE)
					newSides--;
				else if(newSides - 1 < Constants.MIN_POLIGON_POINT_SIZE)
					newSides++;
				else
				{
					if(Math.random() < 0.5)
						newSides--;
					else
						newSides++;
				}
			}

			sides = newSides;
		}
		
		pawnOptions.sides = sides;

		var pawnList = [];

		for(var i = 0; i < amount; i++)
			pawnList.push(new BoardPawn(pawnOptions));

		return pawnList;
	}

	/**
	 * Calculates a new randomized value for polygon-shaped pawn sides. 
	 * @see Constants.js for minimum or maxumum polygon point size. 
	 * @return {Integer} A new randomized amount of polygon sides. 
	 */
	function calcSides(){
		var minSides = Constants.MIN_POLIGON_POINT_SIZE;
		var maxSides = Constants.MAX_POLIGON_POINT_SIZE;
		return Math.floor(Math.random()*(maxSides-minSides))+minSides;
	}

}());