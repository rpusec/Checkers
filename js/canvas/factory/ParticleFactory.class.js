/**
 * Factory class which creates particles 
 * and displays them on the screen. 
 * @class 
 * @author Roman Pusec
 */
var ParticleFactory = {};

(function(){

	var stage = null;
	var particles = [];

	/**
	 * Initializes the factory. 
	 * @param  {Object} options Represents parameters. 
	 *                          - {createjs.Stage} stage => The stage reference. 
	 *                          - {Integer} particleNum => The number of expected particles. 
	 *                          - {Number} particleSize => The size of each particle.
	 *                          - {String} particleColor => The color of each particle. 
	 *                          - {String} particleStrokeColor => The stroke color of each particle. 
	 *                          - {Number} particleStrokeWidth => The stroke width of each particle. 
	 */
	ParticleFactory.initialize = function(options){ 
		while(particles.length > 0)
			particles.pop();

		options = $.extend({
			stage: null,
			particleNum: 7,
			particleSize: 3,
			particleColor: Constants.COLOR_ONE,
			particleStrokeColor: Constants.COLOR_TWO,
			particleStrokeWidth: 1
		}, options);

		stage = options.stage;

		for(var i = 0; i < options.particleNum; i++)
		{
			var newParticle = new createjs.Shape();
			newParticle.graphics
				.setStrokeStyle(options.particleStrokeWidth)
				.beginStroke(options.particleStrokeColor)
				.beginFill(options.particleColor)
				.drawCircle(0, 0, options.particleSize);
			particles.push(newParticle);
		}
	}

	/**
	 * Displays the particles on the canvas. 
	 * @param  {createjs.Point} point Represents the point from which all of the particles will spawn and then separate. 
	 */
	ParticleFactory.spawnParticles = function(point){
		particles.forEach(function(particle){
			createjs.Tween.removeTweens(particle);
			if(stage.contains(particle))
				stage.removeChild(particle);

			particle.x = point.x;
			particle.y = point.y;
			particle.alpha = 1;

			if(!stage.contains(particle))
				stage.addChild(particle);

			var randomAngle = Math.random()*(Math.PI*2);
			var cos = Math.cos(randomAngle) * Constants.PARTICLE_DISTANCE;
			var sin = Math.sin(randomAngle) * Constants.PARTICLE_DISTANCE;

			createjs.Tween.get(particle).to({x: particle.x + cos, y: particle.y + sin}, 1000, createjs.Ease.backOut).wait(100).to({alpha: 0}, 1000).call(function(){
				if(this.parent !== null)
					this.parent.removeChild(this);
			});
		});
	}

}());