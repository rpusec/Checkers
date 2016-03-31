(function(){

	function TurnTimer(options){
		this.WaitingMessage_constructor($.extend({
			radius: 20,
			lineWidth: 5
		}, options));

		if(typeof options !== 'object')
			options = {};

		options = $.extend({
			startTime: 10,
			onEndHandler: null,
			scaleDecrAmount: 0.25,
			onRunOutText: 'Over',
			onEndText: 'Stopped',
			delay: 1000
		}, options);

		var initialStartTime = options.startTime;

		options.startTime = Math.abs(options.startTime);
		this.setText(options.startTime);

		this.startTimer = function(){
			this.endTimer("" + initialStartTime);

			createjs.Tween.get(this, {loop:true}).to({scaleX: this.scaleX-options.scaleDecrAmount, scaleY: this.scaleY-options.scaleDecrAmount}, options.delay).call(function(){
				if(options.startTime > 0)
				{
					options.startTime--;
					this.setText(options.startTime);
				}
				else
				{
					this.endTimer(options.onRunOutText);
					if(options.onEndHandler !== null && typeof options.onEndHandler === 'function')
						options.onEndHandler();
				}
			});
		}

		this.endTimer = function(text){
			createjs.Tween.removeTweens(this);
			options.startTime = initialStartTime;
			if(typeof text === 'string')
				this.setText(text);
			else
				this.setText(options.onEndText);
			this.scaleX = 1;
			this.scaleY = 1;
		}

		this.x = 100;
		this.y = 100;
		window.testTimer = this;
	}

	var p = createjs.extend(TurnTimer, WaitingMessage);

	window.TurnTimer = createjs.promote(TurnTimer, 'WaitingMessage');

}());