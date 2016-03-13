(function(){

	var LEFT_DIR = 1;
	var RIGHT_DIR = 2;
	var UP_DIR = 3;
	var DOWN_DIR = 4;

	/**
	 * Text which fades in or out. 
	 * - text          Text to display.
	 * - x             X coordinate of the text. 
	 * - y             Y coordinate of the text. 
	 * - [speed]       Speed of fading in or out in milliseconds. 
	 * - [farAway]     How far away will the text be from the specified location when initialized.  
	 * - [font]        Font and the size of the font (e.g. 'bold 12px Arial').  
	 * - [color]       Color of the font
	 * @author Roman Pusec
	 */
	function AppearingText(options){
		this.Text_constructor();
		this.text = options.text;

		if(typeof options.font === 'undefined')
			options.font = '12px Arial';

		if(typeof options.color === 'undefined')
			options.color = '#337ab7';

		if(typeof options.farAway === 'undefined')
			options.farAway = 15;

		if(typeof options.speed === 'undefined')
			options.speed = 500;

		if(typeof options.textAlign === 'undefined')
			options.textAlign = 'left';

		this.alpha = 0;
		this.textAlign = options.textAlign;
		this.x = options.x;
		this.y = options.y;
		this.font = options.font;
		this.color = options.color;

		switch(Math.ceil(Math.random()*Math.max(LEFT_DIR, RIGHT_DIR, UP_DIR, DOWN_DIR)))
		{
			case LEFT_DIR : 
				this.x += options.farAway;
				break;
			case RIGHT_DIR : 
				this.x -= options.farAway;
				break;
			case UP_DIR : 
				this.y += options.farAway;
				break;
			case DOWN_DIR : 
				this.y -= options.farAway;
				break;
		}

		createjs.Tween.get(this).to({alpha: 1, x: options.x, y: options.y}, options.speed, createjs.Ease.quartOut);
	}

	var p = createjs.extend(AppearingText, createjs.Text);

	window.AppearingText = createjs.promote(AppearingText, 'Text');

}());