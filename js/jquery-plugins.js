(function($){

$.fn.toggleBubbleOn = function(completeFunct){
	$(this).hide();
	$(this).css('opacity', 0);
	$(this).find('span').css('opacity', 0);
	$(this).animate({
		height: 'toggle',
		opacity: 1
	}, 250, function(){
		$(this).find('span').animate({
			opacity: 1
		}, 250);
		if(typeof completeFunct === 'function')
			completeFunct();
	});
}

$.fn.toggleBubbleOff = function(){
	$(this).find('span').animate({
		opacity: 0
	}, 250, function(){
		$(this).parent().animate({
			height: 'toggle',
			opacity: 0
		}, 250, function(){
			$(this).remove();
		});
	});
}

}(jQuery));