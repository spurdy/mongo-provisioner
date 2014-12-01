'use strict';

var _ = require('lodash'),
    mongo = require('mongodb').MongoClient,
    printf = require('util').format,
    random = require('./random');

var defaults = {
  host: 'localhost',
  port: 27017,
  prefix: null,
  minSuffix : 5,
  minId: 0,
  minPasswordLength: 32,
  dbName : null,
  userName: null,
  userPassword: null,
  userRole: 'dbOwner',
  authDb : 'admin'
};

function makeName(options){
  var parts = [random.number(options.minSuffix, options.minId)];
  if(options.prefix)
    parts.unshift(options.prefix, '_');
  return parts.join('');
}

function createConfig(options){
  var cfg = _.clone(options);
  cfg.dbName = options.dbName || makeName(options);
  cfg.userName = options.userName || cfg.dbName;
  cfg.userPassword = options.userPassword || random.passwd(options.minPasswordLength);
  return cfg;
}

function buildConnectionString(user, pw, options){
  var format = "mongodb://%s:%s@%s:%s/%s?authSource=%s";

  return printf(format, user, pw, options.host, options.port, options.dbName, options.authDb);
}

function provision(user, pw, options, cb){
  if(_.isFunction(options)){
    cb = options;
    options = {};
  }
  options = _.defaults(options || {}, defaults);
  var config = createConfig(options);

  var mongoUrl = buildConnectionString(user, pw, config);
  mongo.connect(mongoUrl, function(e, db){
    if(e) return cb(e);
    db.command({usersInfo: 1}, function(err, result){ //make sure the database wasn't already created
        if (result.length===0){ // no users are in the database, can assume it is new
            db.addUser(config.userName, config.userPassword, {role: options.userRole}, function(err, res){
                if(err) return cb(err);
                    return cb(null, config);
            });
        }
        else return cb(new Error('A database with this name already exists'));
    })
  });
}

module.exports = provision;
