/**
 * [GameBusiness description]
 * @type {Object}
 */
var GameBusiness = {};

(function(){

	var gb = GameBusiness;

	gb.makePawnsSelectable = function(arrPawns){

		arrPawns.forEach(function(pawn){
			pawn.makePawnSelectable();
		});
	}

}());