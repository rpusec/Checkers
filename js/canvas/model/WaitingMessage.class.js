(function(){

	function WaitingMessage(options){
		this.Container_constructor();

		if(typeof options !== 'object')
			options = {};

		options = $.extend({
			linesAmount: 4,
			linesColor: Constants.COLOR_ONE,
			radius: 80,
			lineWidth: 4,
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
			var rotatingLine = new RotatingLine({
				x: 0,
				y: 0,
				radius: options.radius,
				startAngle:0,
				endAngle:Math.random()*Math.PI+Math.PI/2,
				strokeStyle:8,
				color: options.linesColor,
				rotationSpeed:5 * (Math.random() < 0.5 ? -1 : 1),
				rotationVal:Math.random()*20,
				alpha: 0.15
			});

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
	}

	var p = createjs.extend(WaitingMessage, createjs.Container);

	window.WaitingMessage = createjs.promote(WaitingMessage, 'Container');

}());