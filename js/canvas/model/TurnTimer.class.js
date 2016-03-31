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
			delay: 1000,
			popDistance: 50
		}, options);

		var initialStartTime = options.startTime;
		this.initialY;

		options.startTime = Math.abs(options.startTime);
		this.setText(options.startTime);

		this.startTimer = function(){
			this.initialY = this.y;
			this.alpha = 0;
			this.y += options.popDistance;
			createjs.Tween.get(this).to({y: this.y - options.popDistance, alpha: 1}, 250).call(function(){
				this.endTimer("" + initialStartTime, false);
				createjs.Tween.get(this, {loop:true}).to({scaleX: this.scaleX-options.scaleDecrAmount, scaleY: this.scaleY-options.scaleDecrAmount}, options.delay).call(function(){
					if(options.startTime > 0)
					{
						options.startTime--;
						this.setText(options.startTime);
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

		this.getPopDistance = function(){
			return options.popDistance;
		}
	}

	var p = createjs.extend(TurnTimer, WaitingMessage);

	window.TurnTimer = createjs.promote(TurnTimer, 'WaitingMessage');

	window.test = function(){
			var newTT = new TurnTimer();
			newTT.x = 200;
			newTT.y = 200;
			stage.addChild(newTT);
			window.tt = newTT;
		}

}());