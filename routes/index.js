var express = require('express');
var router = express.Router();
var fs = require('fs');
var crypto = require('crypto');

var Groups = require('../models/groups');
var Channels = require('../models/channels');

function randomValue (len) {
    return crypto.randomBytes(Math.ceil(len * 3 / 4))
        .toString('base64')
        .slice(0, len);
}

var isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects
	if (req.isAuthenticated())
		return next();
	// if the user is not authenticated then redirect him to the login page
	res.redirect('/');
}

// Checks if the user belongs to any of the groups provided as arguments.
// ':groupId' refers to req.params.groupId 
var belongsToGroup = function() {
    var groups = Array.prototype.slice.call(arguments);
    return function(req, res, next) {
        if(req.isAuthenticated()) {
            var isAllowed = false;
            groups.forEach(function(group) {
                if (group[0] == ':' ) {
                    group = req.params[group.substr(1)];
                }
                if (req.user.groups.indexOf(group) > -1) {
                      isAllowed = true;
                }
            });
            if (isAllowed) {
                next();
            } else {
                res.redirect('/home');
            }
        } else {
           res.redirect('/');
        }
    }
};


module.exports = function(passport){

	/* GET login page. */
	router.get('/', function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('index', { message: req.flash('message') });
	});

	/* GET login page. */
	router.get('/login', function(req, res) {
    	// Display the Login page with any flash message, if any
		res.render('login', { message: req.flash('message') });
	});

	/* Handle Login POST */
	router.post('/login', passport.authenticate('login', {
		successRedirect: '/home',
		failureRedirect: '/',
		failureFlash : true  
	}));

	/* GET Registration Page */
	router.get('/signup', function(req, res){
		res.render('register',{message: req.flash('message')});
	});

	/* Handle Registration POST */
	router.post('/signup', passport.authenticate('signup', {
		successRedirect: '/home',
		failureRedirect: '/signup',
		failureFlash : true  
	}));

	/* GET Home Page */
	router.get('/home', isAuthenticated, function(req, res){
           var resources = Object.keys(req.user.resources);
           if (resources.length == 1) {
               res.redirect('/group/' + resources[0]);
           } else {
               var message;
               if (resources.length == 0) {
                   message = "Du är inte med i någon av grupperna. Var god kontakta din instruktör.";
               }
               res.render('home', { user: req.user, message: message, resources: req.user.resources });
           }
	});

        /* Group page */
        router.get('/group/:groupId', belongsToGroup(':groupId'), function(req, res) {
            Groups.findOne().where('name', req.params.groupId).exec(function(err, group) {
                if (err) {
                    res.send(404);
                } else {
                    var canOpenChannel = false;
                    var canCloseChannel = false;
                    var canWatchChannel = false;
                    if (Channels.isIdle(group.name)) {
                        if  (req.user.groups.indexOf('staff') > -1) {
                            canOpenChannel = true;
                        }
                    } else {
                       if (Channels.isOwner(group.name, req.user.username)) {
                            canCloseChannel = true;
                       } else {
                            canWatchChannel = true;
                       }
                    }
                    var templateData = { user: req.user,
                        group: {name: group.name, displayName: group.displayName || group.name, resources: group.resources},
                        canOpenChannel: canOpenChannel,
                        canCloseChannel: canCloseChannel, 
                        canWatchChannel: canWatchChannel,
                        message: req.flash('message') 
                    };
                    res.render('group', templateData);
                }
            });
        });

        /* Present on channel */
        router.get('/present/:groupId/deck/:deckId', belongsToGroup(':groupId') , function(req, res) {
            var secret = randomValue(32);
            if (Channels.book(req.params.groupId, req.user.username, secret, req.params.deckId) || Channels.isOwner(req.params.groupId, req.user.username)) {
                res.render('../decks/'+req.params.deckId+'/index', { user: req.user, mode: 'master', multiplex: { url: req.protocol + '://' + req.get('Host'), id: req.params.groupId, secret: secret }});
            } else {
                req.flash('message', 'Kanalen ' + req.params.groupId + ' är upptagen!');
                res.redirect('/group/'+ req.params.groupId);
            }
        });

        /* Watch channel */
        router.get('/watch/:groupId', belongsToGroup(':groupId'), function(req, res) {
            res.render('../decks/'+Channels.getDeckName(req.params.groupId)+'/index', { user: req.user, mode: 'client', multiplex: { url: req.protocol + '://' + req.get('Host'), id: req.params.groupId, secret: null }});
        });

        /* Close channel */
        router.get('/close/:groupId', belongsToGroup(':groupId'), function(req, res) {
            if (Channels.releaseFromServer(req.params.groupId, req.user.username)) {
                res.redirect('/group/'+ req.params.groupId);
            } else {
                req.flash('message', 'Kanalen kunde inte släppas!');
                res.redirect('/group/'+ req.params.groupId);
            }
        });

        /* Deck page */
        router.get('/deck/:deckId', isAuthenticated, function(req, res) {
            res.render('../decks/'+req.params.deckId+'/index', { user: req.user });
        });

	/* Handle Logout */
	router.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

	return router;
}





