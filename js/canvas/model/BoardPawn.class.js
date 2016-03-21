(function(){

	/**
	 * Represents a polygon-shaped pawn used by both players. 
	 * @param {Object} options Represents parameters. 
	 *                         - {Number} strokeStyle => The width of the pawn's border. 
	 *                         - {String} strokeColor => The color of the border. 
	 *                         - {String} bgColor => The background color of the pawn. 
	 *                         - {Number} radius => The radius of the pawn. 
	 *                         - {Number} pointSize => The pointiness of each polygon 'spike'. 
	 *                         - {Integer} sides => The number of sides of the pawn. 
	 * @author Roman Pusec
	 * @augments {createjs.Shape}
	 * @see Easeljs createjs.Shape API documentation. 
	 */
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