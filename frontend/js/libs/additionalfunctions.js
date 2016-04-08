function formatLineByLine(arrItems){

	var itemsStr = '';
					
	arrItems.forEach(function(item){
		itemsStr += item + "<br />";
	});

	return itemsStr;
} 