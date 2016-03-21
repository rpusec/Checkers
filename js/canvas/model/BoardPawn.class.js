(function(){

	function BoardPawn(options){
		this.Shape_constructor();

		if(typeof options !== 'object')
			options = {};

		options = $.extend({
			strokeStyle: 3,
			strokeColor: '#000',
			bgColor: '#fff',
			radius: 20,
			pointSize: 0,
			sides: 4
		}, options);

		this.graphics
		.setStrokeStyle(options.strokeStyle)
		.beginStroke(options.strokeColor)
		.beginFill(options.bgColor)
		.drawPolyStar(0, 0, options.radius, options.sides, options.pointSize, 0);
	}

	var p = createjs.extend(BoardPawn, createjs.Shape);

	window.BoardPawn = createjs.promote(BoardPawn, 'Shape');

}());