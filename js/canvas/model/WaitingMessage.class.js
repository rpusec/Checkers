(function(){

	/**
	 * Represents a particular message with a 'waiting' or 'loading' characteristic to it. 
	 * @param {Object} options Represents parameters of the object. 
	 *                         - {Integer} linesAmount => The amount of rotating lines. 
	 *                         - {String} linesColor => The color of the rotating lines. 
	 *                         - {Number} radius => The radius of the lines and the background. 
	 *                         - {Number} lineWidth => The width or the thickness of the lines.
	 *                         - {String} text => The text to be displayed. 
	 *                         - {String} textColor => The color of the text. 
	 *                         - {String} font => The font of the text (e.g. '20px Arial'). 
	 *                         - {Number} textBorder => The border size of the text. 
	 *                         - {String} textBorderColor => The color of the border of the text. 
	 *                         - {String} bgCircleColor => The color of the circular background. 
	 * @author Roman Pusec
	 * @augments {createjs.Container}
	 * @requires RotatingLine.class.js
	 */
	function WaitingMessage(options){
		this.Container_constructor();

		if(typeof options !== 'object')
			options = {};

		options = $.extend({
			linesAmount: 4,
			linesColor: Constants.COLOR_ONE,
			radius: 80,
			lineWidth: 20,
			text: 'Text unspecified. ',
			textColor: '#fff',
			font: '18px Arial',
			textBorder: 4,
			textBorderColor: '#000',
			bgCircleColor: 'rgba(0,0,0,0.5)'
		}, options);

		var bgCircle = new createjs.Shape();
		bgCircle.graphics.beginFill(options.bgCircleColor).drawCircle(0, 0, options.radius);
		this.addChild(bgCircle);

		for(var i = 0; i < options.linesAmount; i++)
		{
			var rotatingLine = new RotatingLine({radius: options.radius, strokeStyle: options.lineWidth});
			rotatingLine.startRotation();
			this.addChild(rotatingLine);
		}

		var text = new createjs.Text(options.text, options.font, options.textColor);
		text.textAlign = 'center';
		text.textBaseline = 'middle';

		var textBorder = text.clone();
		textBorder.outline = options.textBorder;
		textBorder.color = options.textBorderColor;

		this.addChild(textBorder, text);

		this.setText = function(newText){
			options.text = newText;
			text.text = options.text;
			textBorder.text = options.text;
		}
	}

	var p = createjs.extend(WaitingMessage, createjs.Container);

	window.WaitingMessage = createjs.promote(WaitingMessage, 'Container');

}());