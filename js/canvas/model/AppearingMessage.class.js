(function(){

	function AppearingMessage(options){
		this.WaitingMessage_constructor($.extend({
			radius: 40,
			lineWidth: 5
		}, options));

		if(typeof options !== 'object')
			options = {};

		options = $.extend({
			appearDelay: 1500,
			delay: 750,
			bound: 150,
			direction: AppearingMessage.VERTICAL_DIRECTION
		}, options);

		this.alpha = 0;

		this.appear = function(){

			var appearOption;
			var disappearOption;

			switch(options.direction)
			{
				case AppearingMessage.VERTICAL_DIRECTION : 
					this.y -= options.bound;
					appearOption = {y: this.y + options.bound, alpha: 1};
					disappearOption = {y: this.y + options.bound*2, alpha: 0};
					break;
				case AppearingMessage.HORIZONTAL_DIRECTION : 
					this.x -= options.bound;
					appearOption = {x: this.x + options.bound, alpha: 1};
					disappearOption = {x: this.x + options.bound*2, alpha: 0};
					break;
			}

			createjs.Tween.get(this).to(appearOption, options.delay, createjs.Ease.cubicInOut).to({scaleX: 1.05, scaleY: 1.05}, options.appearDelay).to(disappearOption, options.delay, createjs.Ease.cubicInOut).call(function(){
				if(this.parent !== null && this.parent.contains(this))
					this.parent.removeChild(this);
			});
		}
	}

	var p = createjs.extend(AppearingMessage, WaitingMessage);

	window.AppearingMessage = createjs.promote(AppearingMessage, 'WaitingMessage');

	window.AppearingMessage.VERTICAL_DIRECTION = 0;
	window.AppearingMessage.HORIZONTAL_DIRECTION = 1;

}());