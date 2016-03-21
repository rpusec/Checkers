(function(){

	function UserGameProfile(options){
		this.Container_constructor();

		if(typeof options !== 'object')
			options = {};

		options = $.extend({
			firstname: 'Not specified',
			lastname: 'Not specified',
			username: 'Not specified',
			frameStrokeStyle: 2,
			frameStrokeColor: Constants.oddColor,
			font: '12px Arial',
			fontColor: Constants.oddColor,
			side: UserGameProfile.LEFT_SIDE,
			padding: 5,
			margin: 5,
			pFrameAlpha: 0.25
		}, options);

		//default paceholder if an avatar wasn't specified
		if(!options.hasOwnProperty('avatar'))
			options.avatar = new BoardPawn();

		var pawnFrame = new createjs.Shape();
		pawnFrame.graphics
		.setStrokeStyle(options.frameStrokeStyle)
		.beginStroke(options.frameStrokeColor)
		.drawRect(0, 0, options.avatar.getBounds().width + options.padding*2, options.avatar.getBounds().height + options.padding*2);
		pawnFrame.alpha = options.pFrameAlpha;

		var userInfoTxt = new createjs.Text(options.firstname + " " + options.lastname + "\n" + options.username, options.font, options.fontColor);

		if(options.side === UserGameProfile.LEFT_SIDE)
		{
			options.avatar.x = options.avatar.getBounds().width/2 + options.padding;
			options.avatar.y = options.avatar.getBounds().height/2 + options.padding;
			userInfoTxt.x = options.avatar.getBounds().width + options.padding*2 + options.margin;
			userInfoTxt.y = options.avatar.getBounds().height/2 - userInfoTxt.getBounds().height/2 + options.padding;
		}
		else if(options.side === UserGameProfile.RIGHT_SIDE)
		{
			options.avatar.x = options.avatar.getBounds().width/2 + options.padding;
			options.avatar.y = options.avatar.getBounds().height/2 + options.padding;
			userInfoTxt.y = options.avatar.getBounds().height/2 - userInfoTxt.getBounds().height/2;
			pawnFrame.x = userInfoTxt.getBounds().width + options.margin;
			options.avatar.x += userInfoTxt.getBounds().width + options.margin;
		}

		this.addChild(userInfoTxt, pawnFrame, options.avatar);

		this.getMargin = function(){
			return options.margin;
		}

		this.getPadding = function(){
			return options.padding;
		}

		this.getFrameStrokeStyle = function(){
			return options.frameStrokeStyle;
		}
	}

	var p = createjs.extend(UserGameProfile, createjs.Container);

	window.UserGameProfile = createjs.promote(UserGameProfile, 'Container');

	window.UserGameProfile.LEFT_SIDE = 0;
	window.UserGameProfile.RIGHT_SIDE = 1;

}());