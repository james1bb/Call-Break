var chai = require('chai');
var assert  = chai.assert;
var expect = chai.expect;
var g = require('../javascript/game.js').game;
var player = require("../javascript/player.js").entities;

var game;
var player1,player2,player3,player4;

beforeEach(function(){
	game=new g.Game();

	player1=new player.Player("A");
	player2=new player.Player("B");
	player3=new player.Player("C");
	player4=new player.Player("D");

	game.addPlayer(player1)			
	game.addPlayer(player2);
	game.addPlayer(player3);

});


describe("addPlayer",function(){
	it("cannot add more than 4 players",function() {
		var player5=new player.Player("E");
		game.addPlayer(player4);
		game.addPlayer(player5);

		expect(game.hasPlayer(player1)).to.be.true;
		expect(game.hasPlayer(player2)).to.be.true;
		expect(game.hasPlayer(player3)).to.be.true;
		expect(game.hasPlayer(player4)).to.be.true;
		expect(game.hasPlayer(player5)).to.be.false;
	});	
}); 

describe("canStartGame",function(){
	it("should start when there are four players",function() {
		expect(game.canStartGame()).to.be.false;
		game.addPlayer(player4);
		expect(game.canStartGame()).to.be.true;
	});

	it("should not start when there are fewer than four players",function() {
		expect(game.canStartGame()).to.be.false;
	});	
}); 

describe("getPlayerSequenceFor",function(){
	it("should provide the original sequence for the first player",function() {
		game.addPlayer(player4);

		expect(game.getPlayerSequenceFor(player1.name)).to.eql(["A","B","C","D"]);
		expect(game.getPlayerSequenceFor(player2.name)).to.eql(["B","C","D","A"]);
		expect(game.getPlayerSequenceFor(player3.name)).to.eql(["C","D","A","B"]);
		expect(game.getPlayerSequenceFor(player4.name)).to.eql(["D","A","B","C"]);
	});

	it("should throw an error for a player not in the game");	
}); 