(function(){

	/**
	 * This object represents the board on which two players will be playing. 
	 * @param {Object} options Plain object which represents the properties of the instance. 
	 *                         - {Number} [width] => The width of the board. 
	 *                         - {Number} [height] => The height of the board. 
	 *                         - {Integer} [rowAmount] => The amount of blocks on the Y axis. 
	 *                         - {Integer} [colAmount] => The amount of blocks on the X axis. 
	 *                         - {String} [COLOR_ONE] => The color specified for each block who's position is divisable by three. 
	 *                         - {String} [COLOR_TWO] => The color specified for each block who's position is divisable by two. 
	 * @author Roman Pusec
	 * @augments {createjs.Container}
	 */
	function Board(options){
		this.Container_constructor();

		if(typeof options !== 'object')
			options = {};

		options = $.extend({
			width: 300,
			height: 200,
			rowAmount: 8,
			colAmount: 8,
			COLOR_ONE: Constants.COLOR_ONE,
			COLOR_TWO: Constants.COLOR_TWO,
			borderColor: Constants.COLOR_ONE,
			borderWidth: 3
		}, options);

		//width and height of each rectangle 
		var rectWidth = options.width / options.colAmount;
		var rectHeight = options.height / options.rowAmount;

		for(var row = 0; row < options.rowAmount; row++)
		{
			for(var col = 0; col < options.colAmount; col++)
			{
				//each row which is divisable by two (so second, fourth, sixth, etc...) 
				//has the opposite color scheme 
				var currCOLOR_TWO = ((row % 2) === 0) ? options.COLOR_TWO : options.COLOR_ONE;
				var currCOLOR_ONE = ((row % 2) === 0) ? options.COLOR_ONE : options.COLOR_TWO;

				var newBlock = new createjs.Shape();
				newBlock.graphics.beginFill((col % 2) === 0 ? currCOLOR_TWO : currCOLOR_ONE).drawRect(rectWidth*col, rectHeight*row, rectWidth, rectHeight);
				newBlock.point = new createjs.Point(col, row);
				this.addChild(newBlock);
			}
		}

		var boardBorder = new createjs.Shape();
		boardBorder.graphics.setStrokeStyle(options.borderWidth).beginStroke(options.borderColor).drawRect(0, 0, options.width, options.height);
		this.addChild(boardBorder);

		this.cache(0, 0, options.width, options.height);

		/**
		 * Returns the dimensions of a block. 
		 * @return {Object} Plain object with 'width' and 'height' properties. 
		 */
		this.getRectDimensions = function(){
			return {width: rectWidth, height: rectHeight};
		}

		this.getRowAmount = function(){
			return options.rowAmount;
		}

		this.getColAmount = function(){
			return options.colAmount;
		}
	}

	var p = createjs.extend(Board, createjs.Container);

	window.Board = createjs.promote(Board, 'Container');

}());