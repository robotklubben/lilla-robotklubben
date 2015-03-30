var mongoose = require('mongoose');
var async = require('async');

var hyperLinkSchema = new mongoose.Schema({
    uri: String,
    text: String
});

var groupsSchema = new mongoose.Schema ({
    name: {type: String, index: {unique: true}, required: true},
    displayName: String,
    members: {type: [String], required: true},
    groups: [String],
    resources: {
        decks: [hyperLinkSchema],
        programs: [hyperLinkSchema]
    }
}); 

groupsSchema.methods.includes = function(username, callback) {
    var self = this;
    //console.log('Is %s member of %s?', username, this.name);
    if ( this.members.indexOf(username) > -1 ){
        //console.log('%s is member of %s', username, this.name);
        callback(null, true);
    } else if (this.groups.length > 0) {
        this.model('Groups').find().where('name').in(this.groups).exec(function(err, groups) {
            if(err) callback(err);
            async.detect(groups, function(group, cb) {
                group.includes(username, function(err, included) {
                    if (err) throw err;
                    cb(included);
                });
            }, function(result) {
	        if (result === undefined) {
                    //console.log('%s is not member of %s', username, self.name);
                    callback(null, false);
                } else {
                    //console.log('%s is member of %s and hence %s', username, result.name, self.name);
                    callback(null, true);
                }
            });
        });
    } else {
        callback(null, false);
    }
}

groupsSchema.methods.containsResources = function() {
    return (this.resources.decks.length > 0 || this.resources.programs.length > 0);
}

module.exports = mongoose.model('Groups', groupsSchema);

