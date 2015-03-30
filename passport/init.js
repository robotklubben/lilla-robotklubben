var async = require('async');
var login = require('./login');
var signup = require('./signup');
var User = require('../models/user');
var Groups = require('../models/groups');

module.exports = function(passport){

	// Passport needs to be able to serialize and deserialize users to support persistent login sessions
    passport.serializeUser(function(user, done) {
        console.log('serializing user: ', user.username);
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            if(err) return(done(err));
            var groupnames = [];
            var resources = {};
            //Groups.find().where('members', user.username).exec(function (err, groups) {
            Groups.find().exec(function (err, groups) {
                if (err) throw(err);
                async.each(groups, function(group, callback) {
                    group.includes(user.username, function(err, included) {
                        if (err) callback(err);
                        if (included) {
                            groupnames.push(group.name);
                            if (group.containsResources()) {
                               resources[group.name] = group.displayName || group.Name;
                            }
                        }
                        callback();
                    });
                }, function(err) {
                    console.log('deserializing user ', user.username);
                    done(err, {_id: user._id, firstName: user.firstName, lastName:user.lastName, groups: groupnames, resources: resources, username: user.username, email: user.email});
                });                        
            }); 
        });
    });

    // Setting up Passport Strategies for Login and SignUp/Registration
    login(passport);
    signup(passport);

}
