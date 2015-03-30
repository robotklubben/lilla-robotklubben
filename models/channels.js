var channels = {};

exports.isIdle = function (channel) {
    if (! channels.hasOwnProperty(channel)) {
        return true;	
    } else {
        return false;
    }
};

exports.isOwner = function (channel, user) {
    if (channels.hasOwnProperty(channel)) {
        return channels[channel]['owner'] == user;
    } else {
        return false;
    }
};

exports.book = function (channel, owner, secret, deck) {
    if (! channels.hasOwnProperty(channel)) {
	channels[channel] = {secret: secret, owner: owner, deck: deck};
        return true;
    } else {
        return false; 
    }
};

exports.releaseFromClient = function (channel, secret) {
    if (channels.hasOwnProperty(channel) && channels[channel]['secret'] == secret) {
        delete channels[channel];
        return true;
    } else {
        return false;
    }
};

exports.releaseFromServer = function (channel, user) {
    if (channels.hasOwnProperty(channel) && channels[channel]['owner'] == user) {
        delete channels[channel];
        return true;
    } else {
        return false;
    }
};

exports.checkSecret = function (channel, secret) {
    if (channels.hasOwnProperty(channel) && channels[channel]['secret'] == secret) {
        return true;
    } else{
        return false;
    }
};

exports.getDeckName = function (channel) {
    if (channels.hasOwnProperty(channel)) {
        return channels[channel]['deck'];
    } else {
        return null; 
    }
};

