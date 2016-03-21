/**
 * Includes functions to create appropriate pawns for 
 * both player and player's opponent. 
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
	BoardPawnFactory.createPlayerPawns = function(amount){
		return createPawns(amount, playerPawnOptions);
	}

	/**
	 * Creates the pawn list for the player's opponent. 
	 * @see Constants.js for the default amount value. 
	 * @param  {Integer} amount The amount of pawns to generate. 
	 * @return {Array}        	List of pawns specified for the player's opponent.  
	 */
	BoardPawnFactory.createOpponentPawns = function(amount){
		return createPawns(amount, opponentPawnOptions);
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
	function createPawns(amount, pawnOptions){
		if(typeof amount !== 'number')
			amount = Constants.PAWN_AMOUNT;

		if(sides === null)
			sides = Constants.POLIGON_POINT_TYPE[calcPolyPointTypeIndex()];
		else
		{
			var newSides = calcPolyPointTypeIndex();

			//to ensure that player's and opponent's
			//pawns are always different when it comes
			//to the number of sides from both of them 
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

		return {list: pawnList, avatar: new BoardPawn(avatarOptions)};
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