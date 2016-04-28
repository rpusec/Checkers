(function(){
    
	var Constants = rpcheckers.game.config.Constants;

	/**
	 * Represents a single game room icon on the start of the game. 
	 * @param {Object} options A plain object which represents parameters for the class. Includes:
	 *                         - {Integer} roomNum => Room number to display. 
	 *                         - {Integer} roomID => ID of the room from the database. 
	 *                         - {Integer} numrectsX => Number of rectangles from the horizontal perspective. 
	 *                         - {Integer} numrectsY => Number of rectangles from the vertical perspective. 
	 *                         - {Number} width => Width of the display object. 
	 *                         - {Number} height => Height of the display object. 
	 *                         - {String} colorO => Color of the boxes that are positioned odd. 
	 *                         - {String} colorE => Color of the boxes that are positioned even. 
	 *                         - {String} colorOUnavailable => The same purpose as colorO, but it's only applied when the GameRoom is set as unavailable. 
	 *                         - {Integer} lineNum => The number of rotating lines. 
         *                         - {Boolean} available => Boolean which indicates whether this GameRoom should be considered as unavailable. 
	 * 
	 * @author Roman Pusec
	 * @augments {createjs.Container}
	 * @class 
	 */
	function GameRoom(options){
		this.Container_constructor();
		var self = this;

		if(typeof options === 'undefined')
			options = {};

		this._options = $.extend({
			roomNum: -1,
			roomID: -1,
			numrectsX: 3,
			numrectsY: 3,
			width: 75,
			height: 50,
			colorO: Constants.COLOR_ONE,
			colorE: Constants.COLOR_TWO,
			unavailableAlpha: 0.25,
			lineNum: 3,
			unavailable: false,
			isWaitingMsg: 'is waiting to play...'
		}, options);

		this.setBounds(0, 0, this._options.width, this._options.height);
		
		var rectWidth = this._options.width / this._options.numrectsX;
		var rectHeight = this._options.height / this._options.numrectsY;

		for(var col = 0; col < this._options.numrectsY; col++)
		{
			for(var row = 0; row < this._options.numrectsX; row++)
			{
				var newRect = new createjs.Shape();
				newRect.graphics.beginFill(((col+row+1) % 2) == 0 ? this._options.colorE : this._options.colorO);
				newRect.graphics.drawRect(col*rectWidth, row*rectHeight, rectWidth, rectHeight);
				newRect.cache(col*rectWidth, row*rectHeight, rectWidth, rectHeight);
				this.addChild(newRect);
			}
		}

		for(var i = 0; i < this._options.lineNum; i++)
		{
			var line = new RotatingLine({
				x: this.getBounds().width/2,
				y: this.getBounds().height/2,
				radius: this.getBounds().width/1.5,
				strokeStyle:8,
				color: this._options.colorO,
				rotationVal:Math.random()*20
			});
			line.startRotation();
			this.addChild(line);
		}

		var txtRoomNum = new createjs.Text(this._options.roomNum, '30px Arial', '#fff');
		txtRoomNum.textAlign = 'center';
		txtRoomNum.textBaseline = 'middle';
		txtRoomNum.x = this.getBounds().width/2;		
		txtRoomNum.y = this.getBounds().height/2;
		var txtRoomNumBorder = txtRoomNum.clone();
		txtRoomNumBorder.outline = 4;
		txtRoomNumBorder.color = "#000";
		this.addChild(txtRoomNumBorder, txtRoomNum);

		var unavailableText = new createjs.Text('unavailable', '20px Arial', this._options.colorO);
		unavailableText.textAlign = 'center';
		unavailableText.textBaseline = 'middle';
		unavailableText.alpha = 0;
		unavailableText.x = this._options.width/2;
		unavailableText.y = this._options.height/2;
		this.addChild(unavailableText);

		var userWaitingText = new createjs.Text('', '15px Arial', '#fff');
		userWaitingText.textAlign = 'center';
		userWaitingText.textBaseline = 'middle';
	
		var userWaitingTextBorder = userWaitingText.clone();
		userWaitingTextBorder.outline = 3;
		userWaitingTextBorder.color = "#000";
		
		var userWaitingCont = new createjs.Container();
		userWaitingCont.addChild(userWaitingTextBorder, userWaitingText);
		
		this.addChild(userWaitingCont);

		userWaitingCont.x = this._options.width/2;
		userWaitingCont.y = this._options.height/2;

		userWaitingCont.scaleX = 0;
		userWaitingCont.scaleY = 0;

		var waitingUserAnnounced = false;

		this.announceWaitingUser = function(username){
			if(waitingUserAnnounced)
				return;

			userWaitingText.text = username + ' ' + this._options.isWaitingMsg;
			userWaitingTextBorder.text = username + ' ' + this._options.isWaitingMsg;
			createjs.Tween.removeTweens(userWaitingCont);		
			userWaitingCont.scaleX = 0;
			userWaitingCont.scaleY = 0;			
			createjs.Tween.get(userWaitingCont).to({scaleX: 1, scaleY: 1}, 1000, createjs.Ease.elasticOut);
			waitingUserAnnounced = true;
		}

		this.unannounceWaitingUser = function(){
			if(!waitingUserAnnounced)
				return;
			
			createjs.Tween.removeTweens(userWaitingCont);
			userWaitingCont.scaleX = 1;
			userWaitingCont.scaleY = 1;	
			createjs.Tween.get(userWaitingCont).to({scaleX: 0, scaleY: 0}, 1500, createjs.Ease.elasticOut);
			waitingUserAnnounced = false;
		}

		/**
		 * Marks the room as unavailable. 
		 * @param {Boolean} b Indicates whether the room should be marked as unavailable. 
		 */
		this.setAsUnavailable = function(b){
			if(typeof b !== 'boolean')
				b = false;

			if(b)
			{
				this.children.forEach(function(child){
					if(child !== unavailableText && child.__proto__.constructor.name !== 'RotatingLine')
						child.alpha = self._options.unavailableAlpha;
				});
				
				unavailableText.alpha = 1;
			}
			else
			{
				this.children.forEach(function(child){
					if(child !== unavailableText && child.__proto__.constructor.name !== 'RotatingLine')
						child.alpha = 1;
				});

				unavailableText.alpha = 0;
			}
		}
	}

	var p = createjs.extend(GameRoom, createjs.Container);

	/**
	 * Returns the database ID of the room. 
	 * @return {Integer} The ID of the room. 
	 */
	p.getRoomID = function(){
		return this._options.roomID;
	}

	/**
	 * Adds mouse listeners to the game room. 
	 */
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

	/**
	 * Removes mouse listeners from the game room. 
	 */
	p.removeMouseEvents = function(){
		this.off('mouseover');
		this.off('mouseout');
		this.off('click');
	}

	window.GameRoom = createjs.promote(GameRoom, 'Container');

}());