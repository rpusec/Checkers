(function(){

	/**
	 * Represents the current game state which displays the current round, 
	 * and the amount of pawns of both the first and the second player.  
	 * @param {Object} options Represents params. 
	 *                         - {String} textColor => The color of the text. 
	 *                         - {String} textFont => The font and size of the text (e.g. 11px Arial). 
	 *                         - {Integer} initialRound => The initial round. 
	 *                         - {Integer} plOnePawnAmount => The amount of player one pawns. 
	 *                         - {Integer} plTwoPawnAmount => The amount of player two pawns. 
	 *                         - {String} playerOneName => The name of the first player. 
	 *                         - {String} playerTwoName => The name of the second player. 
	 *                         - {String} textAlign => The alignment of the text (see the EaselJS documentation on Text). 
	 * @author Roman Pusec
	 * @augments {createjs.Text}
	 * @class 
	 */
	function GameStat(options){
		this.Text_constructor();

		if(typeof options !== 'object')
			options = {};

		options = $.extend({
			textColor: Constants.COLOR_ONE,
			textFont: '11px Arial',
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

		/**
		 * Decreases the player one pawns amount. 
		 */
		this.decrPlayerOnePawns = function(){
			plOnePawnAmount--;
			updateText(this);
		}

		/**
		 * Decreases the player two pawns amount. 
		 */
		this.decrPlayerTwoPawns = function(){
			plTwoPawnAmount--;
			updateText(this);
		}

		/**
		 * Resets the player one pawns amount. 
		 */
		this.resetPlayerOnePawns = function(){
			plOnePawnAmount = options.plOnePawnAmount;
			updateText(this);
		}

		/**
		 * Resets the player two pawns amount. 
		 */
		this.resetPlayerTwoPawns = function(){
			plTwoPawnAmount = options.plTwoPawnAmount;
			updateText(this);
		}

		/**
		 * Increases the round number. 
		 */
		this.incrRound = function(){
			round++;
			updateText(this);
		}

		/**
		 * Resets the round to the initial value. 
		 */
		this.resetRound = function(){
			round = options.initialRound;
			updateText(this);
		}

		/**
		 * Resets all values. 
		 */
		this.resetAll = function(){
			this.resetPlayerOnePawns();
			this.resetPlayerTwoPawns();
			this.resetRound();
		}

		/**
		 * Updates the text with the updated values. 
		 * @param  {GameStat} thisVal Object self reference. 
		 */
		function updateText(thisVal){
			thisVal.text = 'Round ' + round + ' | ' + options.playerOneName + ' pawns: ' + plOnePawnAmount + ' | ' + options.playerTwoName + ' pawns: ' + plTwoPawnAmount;
		}
	}

	var p = createjs.extend(GameStat, createjs.Text);

	window.GameStat = createjs.promote(GameStat, 'Text');

}());