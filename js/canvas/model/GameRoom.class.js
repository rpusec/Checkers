(function(){

	var LEFT_DIR = 1;
	var RIGHT_DIR = 2;
	var UP_DIR = 3;
	var DOWN_DIR = 4;
	var LINE_NUM = 3;

	/**
	 * Represents a game room. 
	 *
	 * @param {Object} options Represents parameters. 
	 *                         - numrectsX: Number of rectangles from the horizontal perspective. 
	 *                         - numrectsY: Number of rectangles from the vertical perspective. 
	 *                         - width: Width of the display object. 
	 *                         - height: Height of the display object. 
	 *                         - colorO: Color of the boxes that are positioned odd. 
	 *                         - colorE: Color of the boxes that are positioned even. 
	 * 
	 * @author Roman Pusec
	 */
	function GameRoom(options){
		this.Container_constructor();

		if(typeof options === 'undefined')
			options = {};
		
		if(typeof options.numrectsX === 'undefined')
			options.numrectsX = 3;

		if(typeof options.numrectsY === 'undefined')
			options.numrectsY = 3;

		if(typeof options.width === 'undefined')
			options.width = 30;

		if(typeof options.height === 'undefined')
			options.height = 30;

		if(typeof options.colorO === 'undefined')
			options.colorO = '#337ab7';

		if(typeof options.colorE === 'undefined')
			options.colorE = '#fff';

		var rectWidth = options.width / options.numrectsX;
		var rectHeight = options.height / options.numrectsY;

		for(var col = 0; col < options.numrectsY; col++)
		{
			for(var row = 0; row < options.numrectsX; row++)
			{
				var newRect = new createjs.Shape();
				newRect.graphics.beginFill(((col+row+1) % 2) == 0 ? options.colorE : options.colorO);
				newRect.graphics.drawRect(col*rectWidth, row*rectHeight, rectWidth, rectHeight);
				newRect.cache(col*rectWidth, row*rectHeight, rectWidth, rectHeight);
				this.addChild(newRect);
			}
		}

		this.setBounds(0, 0, options.width, options.height);

		for(var i = 0; i < LINE_NUM; i++)
		{
			var line = new RotatingLine({
				x: this.getBounds().width/2,
				y: this.getBounds().height/2,
				radius: this.getBounds().width/1.5,
				startAngle:0,
				endAngle:Math.random()*Math.PI+Math.PI/2,
				strokeStyle:8,
				color:'rgba(51,122,183,0.25)',
				rotationSpeed:5 * (Math.random() < 0.5 ? -1 : 1),
				rotationVal:Math.random()*20
			});
			line.startRotation();
			this.addChild(line);
		}
	}

	var p = createjs.extend(GameRoom, createjs.Container);

	window.GameRoom = createjs.promote(GameRoom, 'Container');

}());