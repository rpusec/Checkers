(function(){
    
	var Constants = rpcheckers.game.config.Constants;

	/**
	 * Represents the turn timer, the timer that measures how long a single player turn lasts. 
	 * @param {Object} options Represents parameters. 
	 *                         - {Integer}  startTime => Represents the start time (e.g. if value of 10 is inserted, then the timer will start from 10). 
	 *                         - {Integer}  endTime => Represents the end time (e.g. if value of 1 is inserted, then the timer will end at 1). 
	 *                         - {Function} onEndHandler => Function which is executed when the count down is over. 
	 *                         - {Decimal}   scaleDecrAmount => Represents how fast the timer shrinks after each options.delay value. 
	 *                         - {String}   onRunOutText => Text to be displayed when the timer runs out. 
	 *                         - {String}   onEndText => Text to be displayed when the timer is stopped. 
	 *                         - {Number}   delay => The delay of each count decrement in milliseconds. 
	 *                         - {Number}  popDistance => The appear distance. 
	 *                         - {Number}  x => The X axis.
	 *                         - {Number}  y => The Y axis.
	 *                         - {Boolean}  centerRelativeToCoordinate => Indicates whether the timer should be centered relative to the specified coordinates. 
	 * @author Roman Pusec
	 * @augments {WaitingMessage}
	 * @class 
	 * @see  WaitingMessage documentation for more param options. 
	 */
	function TurnTimer(options){
		this.WaitingMessage_constructor($.extend({
			radius: 40,
			lineWidth: 5,
			font: '23px Arial'
		}, options));

		if(typeof options !== 'object')
			options = {};

		options = $.extend({
			startTime: 10,
			endTime: 1,
			onEndHandler: null,
			scaleDecrAmount: 0.25,
			onRunOutText: 'Over',
			onEndText: 'Stopped',
			delay: 1000,
			popDistance: 50,
			x: 0,
			y: 0,
			centerRelativeToCoordinate: true
		}, options);

		this.alpha = 0;

		this.x = options.x - (options.centerRelativeToCoordinate ? this.getRadius() : 0);
		this.y = options.y - (options.centerRelativeToCoordinate ? this.getRadius() : 0);

		var initialStartTime = options.startTime;
		this.initialY = this.y;

		options.startTime = Math.abs(options.startTime);
		this.setText("" + options.startTime);

		/**
		 * Starts the timer. 
		 */
		this.startTimer = function(){
			this.alpha = 0;
			this.y += options.popDistance;
			createjs.Tween.get(this).to({y: this.y - options.popDistance, alpha: 1}, 250).call(function(){
				this.endTimer("" + initialStartTime, false);
				createjs.Tween.get(this, {loop:true}).to({scaleX: this.scaleX-options.scaleDecrAmount, scaleY: this.scaleY-options.scaleDecrAmount}, options.delay).call(function(){
					if(options.startTime > options.endTime)
					{
						options.startTime--;
						this.setText("" + options.startTime);
					}
					else
					{
						this.endTimer(options.onRunOutText, false);
						if(options.onEndHandler !== null && typeof options.onEndHandler === 'function')
							options.onEndHandler();
					}
				});
			});
		}

		/**
		 * Ends or stops the timer. 
		 * @param  {String} text          The text to be displayed on the timer. 
		 * @param  {Boolean} shouldPopDown Should the poping up animation be executed. Default is true. 
		 */
		this.endTimer = function(text, shouldPopDown){
			createjs.Tween.removeTweens(this);
			options.startTime = initialStartTime;
			if(typeof text === 'string')
				this.setText(text);
			else
				this.setText(options.onEndText);

			this.scaleX = 1;
			this.scaleY = 1;

			if(typeof shouldPopDown !== 'boolean')
				shouldPopDown = true;

			if(shouldPopDown)
			{
				this.y = this.initialY;
				this.alpha = 1;
				createjs.Tween.get(this).to({y: this.y + options.popDistance, alpha: 0}, 500).call(function(){
					this.y = this.initialY;
				});
			}
		}

		/**
		 * Returns the pop distance. 
		 * @return {Number} Pop distance. 
		 */
		this.getPopDistance = function(){
			return options.popDistance;
		}
	}

	var p = createjs.extend(TurnTimer, WaitingMessage);

	window.TurnTimer = createjs.promote(TurnTimer, 'WaitingMessage');

}());