var ld = require('lodash');
var fs = require('fs');
var querystring = require('querystring');
var p=require("./player.js").entities;
var EventEmitter = require('events').EventEmitter;

var rEmitter = new EventEmitter();

var matchHandler = function(url){
	return function(ph){
		return url.match(new RegExp(ph.path));
	};
};

rEmitter.on('next', function(handlers, req, res, next, game){
	if(handlers.length == 0) return;
	var ph = handlers.shift();
	ph.handler(req, res, next, game);
});

var handle_all_post = function(req, res, game){
	var handlers = post_handlers.filter(matchHandler(req.url));
	// console.log(handlers.map(function(ph){
	// 	return ph.path;
	// }),'all post hanlers');
	var next = function(){
		rEmitter.emit('next', handlers, req, res, next, game);
	};
	next();
}; 
var handle_all_get = function(req, res, game){
	var handlers = get_handlers.filter(matchHandler(req.url));
	// console.log(handlers.map(function(ph){
	// 	return ph.path;
	// }),'all get handlers');
	var next = function(){
		rEmitter.emit('next', handlers, req, res, next, game);
	};
	next();
};

// var requestHandler = function(req, res ,game){
// 	if(req.method == 'GET')
// 		handle_all_get(req, res, game);
// 	else if(req.method == 'POST')
// 		handle_all_post(req, res, game);
// 	else
// 		method_not_allowed(req, res);
// };

var method_not_allowed = function(req, res){
	res.statusCode = 405;
	// console.log(res.statusCode);
	res.end('Method is not allowed');
};

var serveIndex = function(req, res, next){
	req.url = '/html/index.html';
	next();
};
var serveStaticFile = function(req, res, next){
	var filePath = './public' + req.url;
	fs.readFile(filePath, function(err, data){
		if(data){
			res.statusCode = 200;
			// console.log(res.statusCode);
			res.end(data);
		}
		else{
			next();
		}
	});
};

var serveJoinPage = function(req ,res , next ,game){
	var player = new p.Player(req.headers.cookie);
	if(!game.hasPlayer(player)){
		req.url = '/html/joinPage.html';
		next();
	};
};

var serveHelpPage = function(req ,res , next){
	req.url = '/html/help.html';
	next();
}
var fileNotFound = function(req, res){
	res.statusCode = 404;
	res.end('Not Found');
	console.log(res.statusCode);
};

var resForJoining = function(req , res, next, game){
		var data = '';
		req.on('data',function(chunk){
			data += chunk;
		});
		req.on('end' , function(){
			var playerName = querystring.parse(data).name;
			var player=new p.Player(req.headers.cookie);
			if(game.hasPlayer(player)){
				res.end(JSON.stringify({alreadyConnected : true }));
			}
			else{
				res.writeHead(200 ,{'Set-Cookie': playerName });
				var player=new p.Player(playerName);
				game.addPlayer(player);
				res.end();
			}
		});
};

var sendUpdate = function(req , res, next, game){
	if(game.canStartGame()){
		game.start();
		res.statusCode = 200;
		res.end(JSON.stringify({status : 'started'}));
	}else{
		res.end(JSON.stringify({
			isGameStarted : game.hasGameStarted(),
			noOfPlayers : game.numberOfPlayers()
		}));
	}
};

var serveHandCards = function(req, res, next, game){
	var hand=game.handOf(req.headers.cookie);
	var cardImages=hand.map(cardToImg);
	res.end(JSON.stringify(cardImages));
};

var cardToImg=function(card) {
	return card.rank.toString()+card.suit[0].toUpperCase()+".png";
}

var writeCall = function(req , res){};

var servePlayersNames = function(req,res,next,game){
	var playerSequence=game.getPlayerSequenceFor(req.headers.cookie);
	res.end(JSON.stringify(playerSequence));
};

var throwCard = function(req, res, next,game){
	var data = '';
	req.on('data',function(chunk){
			data += chunk;
	});
	req.on('end', function(){
		var thrownCard = querystring.parse(data);
		if(!game.isCardThrowableFor(req.headers.cookie,thrownCard.card) 
			|| game.currentPlayer().name != req.headers.cookie)
			res.end('notAllowed');
		else{
			game.makePlay(req.headers.cookie,thrownCard.card)
			res.end('thrown successfully');	
		}
		
	});
};

var updateForTurn = function(req,res,next,game){
	var playerName = req.headers.cookie;
	res.end(JSON.stringify(game.status()));
};

var serveThrowableCards = function(req,res,next,game){
	var playerName = req.headers.cookie;
	var throwableCards=game.throwableCardsFor(playerName);
	res.end(JSON.stringify(throwableCards));
};

var post_handlers = [
	{path : '^/join_user$' , handler : resForJoining},
	{path : '^/html/call$' , handler : writeCall},
	{path : '^/html/throwCard$' , handler : throwCard},
	{path: '', handler: method_not_allowed}
];

var get_handlers = [
	{path: '^/$', handler: serveIndex},
	{path: '^/join$' , handler : serveJoinPage},
	{path: '^/help$' , handler : serveHelpPage},
	{path: '^/update$' , handler : sendUpdate},
	{path: '^/html/cards$', handler: serveHandCards},
	{path:'^/html/names$', handler: servePlayersNames},
	{path: '^/html/tableStatus$', handler: updateForTurn},
	{path: '^/html/throwableCard$', handler: serveThrowableCards},
	{path: '', handler: serveStaticFile},
	{path: '', handler: fileNotFound}
];


module.exports = function(game){
	return function(req, res){
	if(req.method == 'GET')
		handle_all_get(req, res, game);
	else if(req.method == 'POST')
		handle_all_post(req, res, game);
	else
		method_not_allowed(req, res);
};
}