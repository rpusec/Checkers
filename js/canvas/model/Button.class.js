(function(){

	function Button(options, onClickFunct){
		this.Container_constructor();
		var animating = false;

		if(typeof options !== 'object')
			options = {};

		options = $.extend({
			text: 'No text specified. ',
			textColor: ModelConstants.oddColor,
			textColorHovered: ModelConstants.evenColor,
			font: '12px Arial',
			bgColor: ModelConstants.evenColor,
			bgColorHovered: ModelConstants.oddColor,
			borderColor: ModelConstants.oddColor,
			borderColorHovered: ModelConstants.evenColor,
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

		this.appear = function(shouldAnimate){
			if(typeof shouldAnimate !== 'boolean')
			{
				shouldAnimate = true;
				animating = true;
				this.visible = true;
			}

			this.scaleX = 0;
			this.scaleY = 0;
			createjs.Tween.removeTweens(this);

			if(shouldAnimate)
			{
				createjs.Tween.get(this).to({scaleX: 1, scaleY: 1}, options.appearSpeed, createjs.Ease.bounceOut).call(function(){
					animating = false;
				});
			}
		}

		this.disappear = function(shouldAnimate){
			if(typeof shouldAnimate !== 'boolean')
			{
				shouldAnimate = true;
				animating = true;
				this.visible = true;
			}

			this.scaleX = 1;
			this.scaleY = 1;
			createjs.Tween.removeTweens(this);

			if(shouldAnimate)
			{
				createjs.Tween.get(this).to({scaleX: 0, scaleY: 0}, options.appearSpeed, createjs.Ease.bounceOut).call(function(){
					this.visible = false;
					animating = false;	
				});
			}
		}

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