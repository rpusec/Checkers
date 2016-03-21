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

	var sides = null;

	BoardPawnFactory.createPlayerPawnList = function(amount){
		return createPawnList(amount, playerPawnOptions);
	}

	BoardPawnFactory.createOpponentPawnList = function(amount){
		return createPawnList(amount, opponentPawnOptions);
	}

	BoardPawnFactory.resetSides = function(){
		sides = null;
	}

	function createPawnList(amount, pawnOptions){
		if(typeof amount !== 'number')
			amount = Constants.PAWN_AMOUNT;

		if(sides === null)
			sides = calcSides();
		else
		{
			var newSides = calcSides();

			console.log(newSides + " " + sides);

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

	function calcSides(){
		var minSides = Constants.MIN_POLIGON_POINT_SIZE;
		var maxSides = Constants.MAX_POLIGON_POINT_SIZE;
		return Math.floor(Math.random()*(maxSides-minSides))+minSides;
	}

}());