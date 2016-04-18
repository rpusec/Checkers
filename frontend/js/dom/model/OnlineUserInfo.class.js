/**
 * Represents the information of a user who's logged in. 
 * @param {String} firstname The first name of the user. 
 * @param {String} lastname  The last name of the user. 
 * @param {String} username  The username of the user. 
 */
function OnlineUserInfo(firstname, lastname, username, won, lost){
	this.firstname = firstname;
	this.lastname = lastname;
	this.username = username;
	this.won = parseInt(won);
	this.lost = parseInt(lost);
}