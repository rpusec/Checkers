/**
 * @namespace The root namespace of the whole 
 * frontend portion of the application. 
 */
var rpcheckers = {};

/**
 * @namespace The namespace of the game 
 * portion of the application. 
 */
rpcheckers.game = {};

/**
 * @namespace Will store all of the game's AJAX calls. 
 */
rpcheckers.game.ajax = {};

/**
 * @namespace Will store all of the game's 
 * business operations. 
 */
rpcheckers.game.business = {};

/**
 * @namespace Will store all of the game's 
 * factory operations. 
 * @type {Object}
 */
rpcheckers.game.factory = {};

/**
 * @namespace Every other part of the application except the game itself.
 * The acronym stands for Document Object Model, since the canvas is excluded. 
 */
rpcheckers.dom = {};

/**
 * @namespace Will store all of the AJAX calls relating to dom. 
 */
rpcheckers.dom.ajax = {};

/**
 * @namespace Will store all of the configuration relating to dom. 
 */
rpcheckers.dom.config = {};