(function(){
    
	var Constants = rpcheckers.game.config.Constants;
        
	/**
	 * Represents a polygon-shaped pawn used by both players. 
	 * @param {Object} options Represents parameters. 
	 *                         - {Number} strokeStyle => The width of the pawn's border. 
	 *                         - {String} strokeColor => The color of the border. 
	 *                         - {String} bgColor => The background color of the pawn. 
	 *                         - {Number} radius => The radius of the pawn. 
	 *                         - {Number} pointSize => The pointiness of each polygon 'spike'. 
	 *                         - {Integer} sides => The number of sides of the pawn. 
	 *                         - {Integer} particleNum => The number of particles. 
	 *                         - {Number} particleRadius => The radius of each individual particle.
	 *                         - {Number} particleDist => The distance of each individual particle from the pawn. 
	 *                         - {Integer} particleStorkeStyle => The stroke style for a particle. 
	 *                         - {Number} rotationSpeed => How fast should the particles rotate around the pawn. 
	 *                         - {Integer} player => Indicates whether this pawn belongs to the first or the second player. 
	 *                         - {Integer} id => The unique identifier for the target pawn. 
	 * @author Roman Pusec
	 * @augments {createjs.Container}
	 * @class 
	 * @see Easeljs createjs.Shape API documentation. 
	 */
	function BoardPawn(options){
		this.Container_constructor();

		if(typeof options !== 'object')
			options = {};

		var pawnList = null;

		options = $.extend({
			strokeStyle: 3,
			strokeColor: '#000',
			bgColor: '#fff',
			radius: 20,
			pointSize: 0,
			sides: 4,
			particleNum: 5,
			particleRadius: 3,
			particleDist: 13,
			particleStorkeStyle: 1,
			rotationSpeed: 3,
			player: -1,
			id: -1
		}, options);

		var shape = new createjs.Shape();
		shape.graphics
		.setStrokeStyle(options.strokeStyle)
		.beginStroke(options.strokeColor)
		.beginFill(options.bgColor)
		.drawPolyStar(0, 0, options.radius, options.sides, options.pointSize, 0);
		this.addChild(shape);

		var partAngleFragment = Math.PI*2/options.particleNum;
		var particleContainer = new createjs.Container();

		for(var i = 0; i < options.particleNum; i++)
		{
			var newParticle = new createjs.Shape();
			newParticle.graphics
			.setStrokeStyle(options.particleStorkeStyle)
			.beginStroke(options.strokeColor)
			.beginFill(options.bgColor)
			.drawCircle(0, 0, options.particleRadius);
			
			var angle = partAngleFragment*i;
			newParticle.x = Math.cos(angle) * options.particleDist;
			newParticle.y = Math.sin(angle) * options.particleDist;
			particleContainer.addChild(newParticle);
		}

		particleContainer.alpha = 0;
		this.addChild(particleContainer);
		this.setBounds(0, 0, options.radius*2, options.radius*2);
		this.mouseChildren = false;

		/**
		 * Returns the id supplied from the options constructor parameter. 
		 * @return {Integer} The ID of the pawn. 
		 */
		this.getID = function(){
			return options.id;
		}

		/**
		 * Returns the player identification (e.g. either Constants.FIRST_PLAYER or Constants.SECOND_PLAYER).
		 * @see Constants.js for appropriate constants. 
		 * @return {Integer} Player identification. 
		 */
		this.getWhichPlayer = function(){
			return options.player;
		}

		/**
		 * Displays the particles
		 * @param  {Boolean} b True if the particles should be displayed, false otherwise. 
		 */
		this.highlight = function(b){
			if(typeof b !== 'boolean')
				b = true;

			createjs.Tween.removeTweens(particleContainer);

			if(b)
			{
				createjs.Tween.get(particleContainer).to({alpha: 1}, 500);
				createjs.Ticker.removeEventListener('tick', onRotation);
				createjs.Ticker.addEventListener('tick', onRotation);
			}
			else
			{
				createjs.Tween.get(particleContainer).to({alpha: 0}, 500);
				createjs.Ticker.removeEventListener('tick', onRotation);
			}
		}

		/**
		 * Removes the target pawn from the board
		 * @param  {createjs.Stage} stage          The stage reference
		 * @param  {Number} rotationAmount         How much should the pawn move, rotation wise. 
		 * @param  {Number} killOffDelay           How long (in milliseconds) should the animation last. 
		 */
		this.killOff = function(stage, rotationAmount, killOffDelay){
			createjs.Tween.get(this).to({
				scaleX: 0,
				scaleY: 0,
				rotation: Math.random()*rotationAmount * (Math.random() < 0.5 ? -1 : 1)
			}, killOffDelay, createjs.Ease.getBackIn(3)).call(function(){
				if(this.parent !== null)
					this.parent.removeChild(this);
			});
		}

		/**
		 * Handles the rotation of the particles 
		 * @tick
		 */
		function onRotation(){
			particleContainer.rotation += options.rotationSpeed;
			particleContainer.rotation %= 360;
		}
	}

	var p = createjs.extend(BoardPawn, createjs.Container);

	window.BoardPawn = createjs.promote(BoardPawn, 'Container');

}());