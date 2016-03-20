(function(){

	var LEFT_DIR = 1;
	var RIGHT_DIR = 2;
	var UP_DIR = 3;
	var DOWN_DIR = 4;

	/**
	 * Augmented createjs.Text object which fades in or out. 
	 * @param {Object} options A plain object which represents parameters for the class. Includes:
	 *                         - text          Text to display.
	 *                         - x             X coordinate of the text. 
	 *                         - y             Y coordinate of the text. 
	 *                         - [speed]       Speed of fading in or out in milliseconds. 
	 *                         - [farAway]     How far away will the text be from the specified location when initialized.  
	 *                         - [font]        Font and the size of the font (e.g. 'bold 12px Arial').  
	 *                         - [color]       Color of the font
	 * @author Roman Pusec
	 * @augments {createjs.Text}
	 */
	function AppearingText(options){
		this.Text_constructor();
		this.text = options.text;

		this._options = options;

		if(typeof options.font === 'undefined')
			options.font = '12px Arial';

		if(typeof options.color === 'undefined')
			options.color = '#337ab7';

		if(typeof options.farAway === 'undefined')
			options.farAway = 20;

		if(typeof options.speed === 'undefined')
			options.speed = 500;

		if(typeof options.textAlign === 'undefined')
			options.textAlign = 'left';

		this.alpha = 0;
		this.textAlign = options.textAlign;
		this.font = options.font;
		this.color = options.color;
		this.show();
	}

	var p = createjs.extend(AppearingText, createjs.Text);

	p.hide = function(){
		this.x = this._options.x;
		this.y = this._options.y;

		var dirX = this._options.x;
		var dirY = this._options.y;

		switch(Math.ceil(Math.random()*DOWN_DIR))
		{
			case LEFT_DIR : 
				dirX += this._options.farAway;
				break;
			case RIGHT_DIR : 
				dirX -= this._options.farAway;
				break;
			case UP_DIR : 
				dirY += this._options.farAway;
				break;
			case DOWN_DIR : 
				dirY -= this._options.farAway;
				break;
		}

		createjs.Tween.get(this).to({alpha: 0, x: dirX, y: dirY}, this._options.speed, createjs.Ease.quartOut);
	}

	p.show = function(){
		this.x = this._options.x;
		this.y = this._options.y;

		switch(Math.ceil(Math.random()*DOWN_DIR))
		{
			case LEFT_DIR : 
				this.x += this._options.farAway;
				break;
			case RIGHT_DIR : 
				this.x -= this._options.farAway;
				break;
			case UP_DIR : 
				this.y += this._options.farAway;
				break;
			case DOWN_DIR : 
				this.y -= this._options.farAway;
				break;
		}

		createjs.Tween.get(this).to({alpha: 1, x: this._options.x, y: this._options.y}, this._options.speed, createjs.Ease.quartOut);
	}

	window.AppearingText = createjs.promote(AppearingText, 'Text');

}());