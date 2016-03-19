(function(){

	var LEFT_DIR = 1;
	var RIGHT_DIR = 2;
	var UP_DIR = 3;
	var DOWN_DIR = 4;
	var LINE_NUM = 3;

	/**
	 * Represents a game room. 
	 *
	 * @param {Object} options A plain object which represents parameters for the class. Includes:
	 *                         - numrectsX: Number of rectangles from the horizontal perspective. 
	 *                         - numrectsY: Number of rectangles from the vertical perspective. 
	 *                         - width: Width of the display object. 
	 *                         - height: Height of the display object. 
	 *                         - colorO: Color of the boxes that are positioned odd. 
	 *                         - colorE: Color of the boxes that are positioned even. 
	 *                         - colorOUnavailable: The same purpose as colorO, but it's only applied when the GameRoom is set as unavailable. 
	 *                         - available: Boolean which indicates whether this GameRoom should be considered as unavailable. 
	 * 
	 * @author Roman Pusec
	 * @augments {createjs.Container}
	 */
	function GameRoom(options){
		this.Container_constructor();

		if(typeof options === 'undefined')
			options = {};

		this._options = options;
		
		if(typeof options.roomID === 'undefined')
			options.roomID = -1;

		if(typeof options.numrectsX === 'undefined')
			options.numrectsX = 3;

		if(typeof options.numrectsY === 'undefined')
			options.numrectsY = 3;

		if(typeof options.width === 'undefined')
			options.width = 75;

		if(typeof options.height === 'undefined')
			options.height = 50;

		if(typeof options.colorO === 'undefined')
			options.colorO = '#337ab7';

		if(typeof options.colorOUnavailable === 'undefined')
			options.colorOUnavailable = '#ff5e5e';

		if(typeof options.colorE === 'undefined')
			options.colorE = '#fff';

		if(typeof options.unavailable !== 'boolean')
			options.unavailable = false;

		this.setBounds(0, 0, options.width, options.height);
		this.setAsUnavailable(options.unavailable);

		var txtRoomNum = new createjs.Text(options.roomID, '30px Arial', '#fff');
		txtRoomNum.textAlign = 'center';
		txtRoomNum.textBaseline = 'middle';
		txtRoomNum.x = this.getBounds().width/2;		
		txtRoomNum.y = this.getBounds().height/2;
		var txtRoomNumBorder = txtRoomNum.clone();
		txtRoomNumBorder.outline = 4;
		txtRoomNumBorder.color = "#000";
		this.addChild(txtRoomNumBorder, txtRoomNum);
	}

	var p = createjs.extend(GameRoom, createjs.Container);

	p.addMouseEvents = function(){
		var ON_MOUSE_MOVE_AMOUNT = 10;
		var ON_MOUSE_SPEED_AMOUNT = 100;

		this.on('mouseover', function(){
			mouseOverHandler(this, ON_MOUSE_MOVE_AMOUNT, ON_MOUSE_SPEED_AMOUNT);
		});
		
		this.on('mouseout', function(){
			mouseOutHandler(this, ON_MOUSE_MOVE_AMOUNT, ON_MOUSE_SPEED_AMOUNT);
		});

		this.mouseChildren = false;
		var initialY = this.y - ON_MOUSE_MOVE_AMOUNT;

		function mouseOverHandler(thisVal, moveAmount, speedAmount){
			createjs.Tween.get(thisVal).to({y: thisVal.y - moveAmount}, speedAmount);
		}

		function mouseOutHandler(thisVal, moveAmount, speedAmount){
			thisVal.y = initialY;			
			createjs.Tween.removeTweens(thisVal);
			createjs.Tween.get(thisVal).to({y: thisVal.y + moveAmount}, speedAmount);
		}
	}

	p.setAsUnavailable = function(b){
		if(typeof b !== 'boolean')
			b = false;

		var rectWidth = this._options.width / this._options.numrectsX;
		var rectHeight = this._options.height / this._options.numrectsY;

		for(var col = 0; col < this._options.numrectsY; col++)
		{
			for(var row = 0; row < this._options.numrectsX; row++)
			{
				var newRect = new createjs.Shape();
				newRect.graphics.beginFill(((col+row+1) % 2) == 0 ? this._options.colorE : !b ? this._options.colorO : this._options.colorOUnavailable);
				newRect.graphics.drawRect(col*rectWidth, row*rectHeight, rectWidth, rectHeight);
				newRect.cache(col*rectWidth, row*rectHeight, rectWidth, rectHeight);
				this.addChild(newRect);
			}
		}

		for(var i = 0; i < LINE_NUM; i++)
		{
			var line = new RotatingLine({
				x: this.getBounds().width/2,
				y: this.getBounds().height/2,
				radius: this.getBounds().width/1.5,
				startAngle:0,
				endAngle:Math.random()*Math.PI+Math.PI/2,
				strokeStyle:8,
				color: !b ? this._options.colorO : this._options.colorOUnavailable,
				rotationSpeed:5 * (Math.random() < 0.5 ? -1 : 1),
				rotationVal:Math.random()*20,
				alpha: 0.15
			});
			line.startRotation();
			this.addChild(line);
		}
	}

	window.GameRoom = createjs.promote(GameRoom, 'Container');

}());