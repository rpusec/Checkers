(function(){

	function GameStat(options){
		this.Text_constructor();

		if(typeof options !== 'object')
			options = {};

		options = $.extend({
			textColor: Constants.COLOR_ONE,
			textFont: '11px Arial',
			separationAmount: 40,
			initialRound: 1,
			plOnePawnAmount: Constants.PAWN_AMOUNT,
			plTwoPawnAmount: Constants.PAWN_AMOUNT,
			playerOneName: '[not specified]',
			playerTwoName: '[not specified]',
			textAlign: 'center'
		}, options);

		var round = options.initialRound;
		var plOnePawnAmount = options.plOnePawnAmount;
		var plTwoPawnAmount = options.plTwoPawnAmount;

		this.text = '';
		this.font = options.textFont;
		this.color = options.textColor;
		this.textAlign = options.textAlign;
		updateText(this);

		this.decrPlayerOnePawns = function(){
			plOnePawnAmount--;
			updateText(this);
		}

		this.decrPlayerTwoPawns = function(){
			plTwoPawnAmount--;
			updateText(this);
		}

		this.resetPlayerOnePawns = function(){
			plOnePawnAmount = options.plOnePawnAmount;
			updateText(this);
		}

		this.resetPlayerTwoPawns = function(){
			plTwoPawnAmount = options.plTwoPawnAmount;
			updateText(this);
		}

		this.decrRound = function(){
			round--;
			updateText(this);
		}

		this.resetRound = function(){
			round = options.initialRound;
			updateText(this);
		}

		this.resetAll = function(){
			this.resetPlayerOnePawns();
			this.resetPlayerTwoPawns();
			this.resetRound();
		}

		function updateText(thisVal){
			thisVal.text = 'Round ' + round + ' | ' + options.playerOneName + ' pawns: ' + plOnePawnAmount + ' | ' + options.playerTwoName + ' pawns: ' + plTwoPawnAmount;
		}
	}

	var p = createjs.extend(GameStat, createjs.Text);

	window.GameStat = createjs.promote(GameStat, 'Text');

}());