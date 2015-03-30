var express = require('express');
var router = express.Router();
var fs = require('fs');
var crypto = require('crypto');


function randomValue (len) {
    return crypto.randomBytes(Math.ceil(len * 3 / 4))
        .toString('base64')
        .slice(0, len);
}


module.exports = function(){
        /* Deck page */
        router.get('/deck/:deckId', function(req, res) {
            res.render('../decks/'+req.params.deckId+'/index.jade', { user: 'local' });
        });

	return router;
}





