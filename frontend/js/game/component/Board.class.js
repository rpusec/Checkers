(function(){
    
	var Constants = rpcheckers.game.config.Constants;
        
	/**
	 * This object represents the board on which two players will be playing. 
	 * @param {Object} options Plain object which represents the properties of the instance. 
	 *                         - {Number} [width] => The width of the board. 
	 *                         - {Number} [height] => The height of the board. 
	 *                         - {Integer} [rowAmount] => The amount of blocks on the Y axis. 
	 *                         - {Integer} [colAmount] => The amount of blocks on the X axis. 
	 *                         - {String} [COLOR_ONE] => The color specified for each block who's position is divisable by three. 
	 *                         - {String} [COLOR_TWO] => The color specified for each block who's position is divisable by two. 
	 *                         - {String} [selectableBlockColor] => The color of a selectable block. 
	 * @author Roman Pusec
	 * @augments {createjs.Container}
	 * @class 
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
			borderWidth: 3,
			selectableBlockColor: '#fff'
		}, options);

		//width and height of each rectangle 
		var rectWidth = options.width / options.colAmount;
		var rectHeight = options.height / options.rowAmount;

		for(var row = 0; row < options.rowAmount; row++)
		{
			for(var col = 0; col < options.colAmount; col++)
			{
				//each row which is divisable by two (so second, fourth, sixth, etc...) has the opposite color scheme 
				var currCOLOR_TWO = ((row % 2) === 0) ? options.COLOR_TWO : options.COLOR_ONE;
				var currCOLOR_ONE = ((row % 2) === 0) ? options.COLOR_ONE : options.COLOR_TWO;

				//the same goes for columns 
				var blockColor = (col % 2) === 0 ? currCOLOR_TWO : currCOLOR_ONE;
				var newBlock = new createjs.Shape();
				newBlock.graphics.beginFill(blockColor).drawRect(rectWidth*col, rectHeight*row, rectWidth, rectHeight);
				newBlock.point = new createjs.Point(col, row);
				newBlock.unselectableColor = blockColor;
				newBlock.row = row;
				newBlock.col = col;
				newBlock.selectable = false;
				this.addChild(newBlock);
			}
		}

		var boardBorder = new createjs.Shape();
		boardBorder.graphics.setStrokeStyle(options.borderWidth).beginStroke(options.borderColor).drawRect(0, 0, options.width, options.height);
		boardBorder.boardBorder = true;
		this.addChild(boardBorder);
		this.setBounds(0, 0, options.width, options.height);
		this.cache(0, 0, options.width, options.height);

		/**
		 * Marks a particular block as selectable, that is, that the player can move their pawn towards that spot. 
		 * @param  {craetejs.Shape} targetBlock The target board block. 
		 */
		this.markBlockAsSelectable = function(targetBlock){
			targetBlock.graphics.clear().beginFill(options.selectableBlockColor).drawRect(rectWidth*targetBlock.col, rectHeight*targetBlock.row, rectWidth, rectHeight);
			this.updateCache();
			targetBlock.selectable = true;
		}

		/**
		 * Marks a particular block as selectable, that is, that the player can move their pawn towards that spot. 
		 * @param  {craetejs.Shape} targetBlock The target board block. 
		 */
		this.markBlockAsUnselectable = function(targetBlock){
			targetBlock.graphics.clear().beginFill(targetBlock.unselectableColor).drawRect(rectWidth*targetBlock.col, rectHeight*targetBlock.row, rectWidth, rectHeight);
			this.updateCache();
			targetBlock.selectable = false;
		}

		/**
		 * Returns the dimensions of a block. 
		 * @return {Object} Plain object with 'width' and 'height' properties. 
		 */
		this.getRectDimensions = function(){
			return {width: rectWidth, height: rectHeight};
		}

		/**
		 * Returns the amount of rows. 
		 * @return {Integer} The amount of rows. 
		 */
		this.getRowAmount = function(){
			return options.rowAmount;
		}

		/**
		 * Returns the amount of columns. 
		 * @return {Integer} The amount of columns. 
		 */
		this.getColAmount = function(){
			return options.colAmount;
		}
	}

	var p = createjs.extend(Board, createjs.Container);

	window.Board = createjs.promote(Board, 'Container');

}());