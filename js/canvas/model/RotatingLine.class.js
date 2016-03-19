(function(){
	/**
	 * An arc-ish line which rotates in circles. 
	 * @param {Object} options A plain object which represents parameters for the class. Includes:
	 *                         - {Number} x                     X coordinate of the object. 
	 *                         - {Number} y                     Y coordinates of the object. 
	 *                         - {Number} radius                The radius of the circle. 
	 *                         - {Number} startAngle            Starting angle. 
	 *                         - {Number} endAngle              Ending angle. 
	 *                         - {Number} strokeStyle           The width of the line. 
	 *                         - {String} color                 The color of the line. 
	 *                         - {Number} rotationSpeed         The speed of the rotation. 
	 *                         - {Number} rotationVal           The initial rotation value.
	 * @author Roman Pusec
	 * @augments {createjs.Shape}
	 */
	function RotatingLine(options){
		this.Shape_constructor();
		var self = this;

		if(typeof options === 'undefined')
			options = {};

		this.graphics
		.setStrokeStyle(options.strokeStyle, 'round', 'round')
		.beginStroke(options.color)
		.arc(0, 0, options.radius, options.startAngle, options.endAngle)
		.endStroke();

		var radiusPlusStrokeStyle = options.radius + (options.strokeStyle*2);
		this.cache(radiusPlusStrokeStyle * -1, radiusPlusStrokeStyle * -1, radiusPlusStrokeStyle*2, radiusPlusStrokeStyle*2);

		this.alpha = options.alpha;
		this.x = options.x;
		this.y = options.y;

		this.rotation = options.rotationVal;

		this.startRotation = function(){
			createjs.Ticker.addEventListener('tick', onRotation);
		}

		this.endRotation = function(){
			createjs.Ticker.removeEventListener('tick', onRotation);
		}

		function onRotation(){
			if(self.parent !== null)
			{
				self.rotation += options.rotationSpeed;
				self.rotation %= 360;
			}
			else
				createjs.Ticker.removeEventListener('tick', onRotation);
		}
	}

	var e = createjs.extend(RotatingLine, createjs.Shape);

	window.RotatingLine = createjs.promote(RotatingLine, 'Shape');
}());