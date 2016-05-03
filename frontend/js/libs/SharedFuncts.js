/**
 * Represents a number of functions that are shared amoung other components. 
 * @author Roman Pusec
 */
var SharedFuncts = {};

/**
 * Formats an array of strings line by line as a string, appropriate by HTML standards. 
 * @param  {Array<String>} arrItems The array of strings. 
 * @return {String}                 The array of strings formated as a single string. 
 */
SharedFuncts.formatLineByLine = function(arrItems){
	var itemsStr = '';
					
	arrItems.forEach(function(item){
		itemsStr += item + "<br />";
	});

	return itemsStr;
}

/**
 * Runs an AJAX call. Includes default properties that are shared among
 * all AJAX requests. 
 * @param  {Object} options Represents parameters. 
 * @see jQuery AJAX documentation for param clarifications. 
 */
SharedFuncts.runAjax = function(options){
	$.ajax($.extend({
		type: 'get',
		processData: false,
		contentType: false,
		dataType: 'json',
		error: function(data){console.log(data);}
	}, options));
}