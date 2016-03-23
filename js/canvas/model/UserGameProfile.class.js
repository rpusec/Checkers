(function(){

	/**
	 * Represents a user profile when playing the game. 
	 * It displays user's first name, last name, username, and avatar. 
	 * 
	 * @param {Object} options Plain object which represents the parameters of the display object. 
	 *                         - {String} firstname => First name of the user. 
	 *                         - {String} lastname => Last name of the user. 
	 *                         - {String} username => Username of the user. 
	 *                         - {Integer} frameStrokeStyle => Thickness of the stroke.  
	 *                         - {String} frameStrokeColor => Color of the stroke. 
	 *                         - {String} font => Font for the text (e.g. '12px Arial'). 
	 *                         - {String} fontColor => Color of the text. 
	 *                         - {Integer} side => Specifies which side should the avatar face. Use constants 'UserGameProfile.LEFT_SIDE' or 'UserGameProfile.RIGHT_SIDE'. 
	 *                         - {Number} padding => Padding of the avatar. 
	 *                         - {Number} margin => Margin of the avatar. 
	 *                         - {Number} pFrameAlpha => Specifies the alpha value of the frame.  
	 *                         - {BoardPawn} avatar => The avatar to display. 
	 *                         
	 * @author Roman Pusec
	 * @augments {createjs.Container}
	 * @requires BoardPawn.class.js
	 */
	function UserGameProfile(options){
		this.Container_constructor();

		if(typeof options !== 'object')
			options = {};

		options = $.extend({
			firstname: 'Not specified',
			lastname: 'Not specified',
			username: 'Not specified',
			frameStrokeStyle: 2,
			frameStrokeColor: Constants.COLOR_ONE,
			font: '12px Arial',
			fontColor: Constants.COLOR_ONE,
			side: UserGameProfile.LEFT_SIDE,
			padding: 5,
			margin: 5,
			pFrameAlpha: 0.25,
			avatar: new BoardPawn()
		}, options);

		var pawnFrame = new createjs.Shape();
		pawnFrame.graphics
		.setStrokeStyle(options.frameStrokeStyle)
		.beginStroke(options.frameStrokeColor)
		.beginFill(options.frameStrokeColor)
		.drawRect(0, 0, options.avatar.getBounds().width + options.padding*2, options.avatar.getBounds().height + options.padding*2);
		pawnFrame.alpha = options.pFrameAlpha;

		var userInfoTxt = new createjs.Text('', options.font, options.fontColor);
		updateUserInfoText();

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

		/**
		 * Returns margin of the user profile. 
		 * @return {Number} Margin. 
		 */
		this.getMargin = function(){
			return options.margin;
		}

		/**
		 * Returns padding of the user profile. 
		 * @return {Number} Padding. 
		 */
		this.getPadding = function(){
			return options.padding;
		}

		/**
		 * Returns the frame stroke style of the user profile
		 * @return {Integer} Frame stroke style. 
		 */
		this.getFrameStrokeStyle = function(){
			return options.frameStrokeStyle;
		}

		this.setFirstname = function(firstname){
			options.firstname = firstname;
			updateUserInfoText();
		}

		this.setLastname = function(lastname){
			options.lastname = lastname;
			updateUserInfoText();
		}

		this.setUsername = function(username){
			options.username = username;
			updateUserInfoText();
		}

		function updateUserInfoText(){
			userInfoTxt.text = options.firstname + " " + options.lastname + "\n" + options.username;
		}
	}

	var p = createjs.extend(UserGameProfile, createjs.Container);

	window.UserGameProfile = createjs.promote(UserGameProfile, 'Container');

	window.UserGameProfile.LEFT_SIDE = 0;
	window.UserGameProfile.RIGHT_SIDE = 1;

}());