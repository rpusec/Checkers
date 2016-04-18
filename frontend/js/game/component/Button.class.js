(function(){
    
	var Constants = rpcheckers.game.config.Constants;
        
	/**
	 * Represents a single clickable button. 
	 * @param {Object} options        Plain object which represents the parameters of the display object.
	 *                                - {String} text => Text to be displayed. 
	 *                                - {String} textColor => The color of the text. 
	 *                                - {String} textColorHovered => The color of the text when hovered. 
	 *                                - {String} font => The font, which also includes the font size and the font itself (e.g. 12px Arial). 
	 *                                - {String} bgColor => The background color of the button. 
	 *                                - {String} bgColorHovered => The background color of the button when hovered. 
	 *                                - {String} borderColor => The color of the border. 
	 *                                - {String} borderColorHovered => The color of the border when hovered. 
	 *                                - {Number} padding => The padding of the button. 
	 *                                - {Integer} strokeStyle => The border width of the button. 
	 *                                - {Number} appearSpeed => The speed in which the button appears or disappears measured in milliseconds. 
	 * @param {Function} onClickFunct Function which is executed when the button is clicked. 
	 * @author Roman Pusec
	 * @augments {createjs.Container}
	 * @class 
	 */
	function Button(options, onClickFunct){
		this.Container_constructor();
		var animating = false;

		if(typeof options !== 'object')
			options = {};

		options = $.extend({
			text: 'No text specified. ',
			textColor: Constants.COLOR_ONE,
			textColorHovered: Constants.COLOR_TWO,
			font: '12px Arial',
			bgColor: Constants.COLOR_TWO,
			bgColorHovered: Constants.COLOR_ONE,
			borderColor: Constants.COLOR_ONE,
			borderColorHovered: Constants.COLOR_TWO,
			padding: 7,
			strokeStyle: 2,
			appearSpeed: 1000
		}, options);

		var btnText = new createjs.Text(options.text, options.font, options.textColor);
		btnText.textAlign = 'center';
		btnText.textBaseline = 'middle';

		var calcWidth = btnText.getBounds().width + options.padding*2 + options.strokeStyle*2;
		var calcHeight = btnText.getBounds().height + options.padding*2 + options.strokeStyle*2;

		var btnBody = new createjs.Shape();
		changeGraphics(options.borderColor, options.bgColor);

		btnText.x = calcWidth/2;
		btnText.y = calcHeight/2;

		this.addChild(btnBody, btnText);

		this.regX = calcWidth/2;
		this.regY = calcHeight/2;

		this.on('mouseover', function(){
			btnText.color = options.textColorHovered;
			changeGraphics(options.borderColorHovered, options.bgColorHovered);
		});

		this.on('mouseout', function(){
			btnText.color = options.textColor;
			changeGraphics(options.borderColor, options.bgColor);
		});

		this.on('click', function(){
			if(typeof onClickFunct === 'function' && !animating && this.visible)
				onClickFunct();
		});

		/**
		 * Displays the button. 
		 * @param  {boolean} shouldAnimate If the animation should be executed. 
		 */
		this.appear = function(shouldAnimate, callFunct){
			if(typeof shouldAnimate !== 'boolean')
				shouldAnimate = true;

			createjs.Tween.removeTweens(this);

			if(shouldAnimate)
			{
				animating = true;
				this.visible = true;
				this.scaleX = 0;
				this.scaleY = 0;
				
				createjs.Tween.get(this).to({scaleX: 1, scaleY: 1}, options.appearSpeed, createjs.Ease.bounceOut).call(function(){
					animating = false;

					if(typeof callFunct === 'function')
						callFunct();
				});
			}
			else
			{
				animating = false;
				this.visible = true;
				this.scaleX = 1;
				this.scaleY = 1;
			}
		}

		/**
		 * Hides the button 
		 * @param  {boolean} shouldAnimate If the animation should be executed. 
		 */
		this.disappear = function(shouldAnimate){
			if(typeof shouldAnimate !== 'boolean')
				shouldAnimate = true;

			createjs.Tween.removeTweens(this);

			if(shouldAnimate)
			{
				animating = true;
				this.visible = true;
				this.scaleX = 1;
				this.scaleY = 1;

				createjs.Tween.get(this).to({scaleX: 0, scaleY: 0}, options.appearSpeed, createjs.Ease.bounceOut).call(function(){
					this.visible = false;
					animating = false;	
				});
			}
			else
			{
				animating = false;
				this.visible = false;
				this.scaleX = 0;
				this.scaleY = 0;
			}
		}

		/**
		 * Alters the graphics of the button, but not its text. 
		 * @param  {String} borderColor The border color of the button. 
		 * @param  {String} bgColor     The background color of the button. 
		 */
		function changeGraphics(borderColor, bgColor){
			btnBody.graphics
				.clear()
				.setStrokeStyle(options.strokeStyle)
				.beginStroke(borderColor)
				.beginFill(bgColor)
				.drawRect(0, 0, 
					calcWidth, 
					calcHeight);
		}
	}

	var p = createjs.extend(Button, createjs.Container);

	window.Button = createjs.promote(Button, 'Container');

}());