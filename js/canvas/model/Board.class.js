(function(){

	function Board(options){
		this.Container_constructor();

		if(typeof options !== 'object')
			options = {};

		options = $.extend({
			width: 300,
			height: 200,
			rowAmount: 8,
			colAmount: 8,
			oddColor: ModelConstants.oddColor,
			evenColor: ModelConstants.evenColor
		}, options);

		var rectWidth = options.width / options.colAmount;
		var rectHeight = options.height / options.rowAmount;

		for(var row = 0; row < options.rowAmount; row++)
		{
			for(var col = 0; col < options.colAmount; col++)
			{
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