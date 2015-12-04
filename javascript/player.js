var ld = require('lodash');
var entities = {};
exports.entities = entities;

entities.Player = function(name){
	Object.defineProperties(this, {
		'name': {
			value: name || 'player',
			enumerable: true
		},
		'hands': {
			value: { diamonds: [], clubs: [], hearts: [], spades: [] },
			enumerable: true,
			writable: true
		},
		'turn': {
			value: false,
			enumerable: true,
			writable: true
		}
	});
};
entities.Player.prototype = {
	throwCard: function(cardName){
		// if(!this.turn)
		// 	return;
		var suit = cardName.split('_')[2];
		return ld.remove(this.hands[suit], function(card){
			return card == cardName;
		});
	},
	makeCall: function(call){
		if(!this.turn)
			return;
		call = (this.round && this.round.call) || (call > 1) && call || 2;
		this.round = {call: call, captured: 0};
	}
};

