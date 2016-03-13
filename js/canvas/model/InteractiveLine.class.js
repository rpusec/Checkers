(function(){

	function InteractiveLine(color, linePosition, lineSize){
		this.Shape_constructor();
		this.graphics.setStrokeStyle(1).beginStroke(color);
		var lineSinglePos = linePosition;
		this.y = lineSinglePos;
		this.graphics.moveTo(0, 0);
		this.graphics.lineTo(lineSize, 0);
		this.graphics.endStroke();
		this.scaleX = 0;
		this.alpha = 0;	
		this._lineSize = lineSize;
		this._toggled = false;
		this._tween = null;
	}

	var p = createjs.extend(InteractiveLine, createjs.Shape);

	p.toggle = function(){

		this._toggled = !this._toggled;

		if(this._toggled)
			this._tween = createjs.Tween.get(this).to({scaleX: 1, alpha: 1}, 1000, createjs.Ease.quartOut);
		else
		{
			this._tween.setPaused(true);
			createjs.Tween.removeTweens(this);
			this.scaleX = 1;
			this._tween = createjs.Tween.get(this).to({scaleX: 0, alpha: 0}, 1000, createjs.Ease.quartOut);
		}
	}

	window.InteractiveLine = createjs.promote(InteractiveLine, 'Shape');

}());