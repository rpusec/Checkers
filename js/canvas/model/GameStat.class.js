(function(){

	function GameStat(options){
		this.Container_constructor();

		if(typeof options !== 'object')
			options = {};

		options = $.extend({
			textColor: Constants.COLOR_ONE,
			textFont: '10px Arial',
			separationAmount: 40,
			initialRound: 1,
			plOnePawnAmount: Constants.PAWN_AMOUNT,
			plTwoPawnAmount: Constants.PAWN_AMOUNT,
			playerOneName: 'Not specified. ',
			playerTwoName: 'Not specified. '
		}, options);

		var round = options.initialRound;
		var plOnePawnAmount = options.plOnePawnAmount;
		var plTwoPawnAmount = options.plTwoPawnAmount;

		var text = new createjs.Text('', options.textFont, options.textColor);
		this.addChild(text);

		this.decrPlayerOnePawns = function(){
			plOnePawnAmount--;
			updateText();
		}

		this.decrPlayerTwoPawns = function(){
			plTwoPawnAmount--;
			updateText();
		}

		this.resetPlayerOnePawns = function(){
			plOnePawnAmount = options.plOnePawnAmount;
			updateText();
		}

		this.resetPlayerTwoPawns = function(){
			plTwoPawnAmount = options.plTwoPawnAmount;
			updateText();
		}

		this.decrRound = function(){
			round--;
			updateText();
		}

		this.resetRound = function(){
			round = options.initialRound;
			updateText();
		}

		function updateText(){
			text.text = 'Round ' + round + ' | ' + options.playerOneName + ' pawns: ' + plOnePawnAmount + ' | ' + options.playerTwoName + ' pawns: ' + plTwoPawnAmount;
		}
	}

	var p = createjs.extend(GameStat, createjs.Container);

	window.GameStat = createjs.promote(GameStat, 'Container');

}());