(function(){

	/**
	 * This object represents the board on which two players will be playing. 
	 * @param {Object} options Plain object which represents the properties of the instance. 
	 *                         - {Number} [width] => The width of the board. 
	 *                         - {Number} [height] => The height of the board. 
	 *                         - {Integer} [rowAmount] => The amount of blocks on the Y axis. 
	 *                         - {Integer} [colAmount] => The amount of blocks on the X axis. 
	 *                         - {String} [oddColor] => The color specified for each block who's position is divisable by three. 
	 *                         - {String} [evenColor] => The color specified for each block who's position is divisable by two. 
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
			oddColor: Constants.oddColor,
			evenColor: Constants.evenColor
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
				var currEvenColor = ((row % 2) === 0) ? options.evenColor : options.oddColor;
				var currOddColor = ((row % 2) === 0) ? options.oddColor : options.evenColor;

				var newBlock = new createjs.Shape();
				newBlock.graphics.beginFill((col % 2) === 0 ? currEvenColor : currOddColor).drawRect(rectWidth*col, rectHeight*row, rectWidth, rectHeight);
				this.addChild(newBlock);
			}
		}

		this.cache(0, 0, options.width, options.height);
	}

	var p = createjs.extend(Board, createjs.Container);

	window.Board = createjs.promote(Board, 'Container');

}());