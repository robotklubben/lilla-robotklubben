var Channels = require('../models/channels');

module.exports = function (io) {
    io.sockets.on('connection', function(socket) {
            socket.on('slidechanged', function(slideData) {
                    if (typeof slideData.secret == 'undefined' || slideData.secret == null || slideData.secret === '') return;
                    if (Channels.checkSecret(slideData.socketId, slideData.secret)) {
                            slideData.secret = null;
                            socket.broadcast.emit(slideData.socketId, slideData);
                    };
            });
            socket.on('releasechannel', function(channel, secret) {
                    if (typeof secret == 'undefined' || secret == null || secret === '') return;
                    if (Channels.releaseFromClient(channel, secret)) {
                            //socket.broadcast.emit(slideData.socketId, slideData);
                    };
            });
    });
}
