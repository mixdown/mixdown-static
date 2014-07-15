var BasePlugin = require('mixdown-app').Plugin;
var _ = require('lodash');
var fs = require('fs');
var mime = require('mime');
var crypto = require('crypto');
var oneCallback = require('one-callback');

var Static = BasePlugin.extend({
  init: function(options) {
    this._super(options);

    _.defaults(this._options, {
      headers: {},
      etag: true
    });
  },

  file: function(opt, callback) {
    var self = this;
    opt = opt || {};

    if (!opt.path) {
      callback(new Error("options.path required"));
      return;
    }
    if (!opt.res) {
      callback(new Error("options.res required"));
      return;
    }

    fs.readFile(opt.path, function(err, content) {
      if (err) {
        callback(err);
        return;
      }

      self.send(_.extend(opt, {
        content: content
      }), callback);
    });

  },

  send: function(opt, callback) {
    var self = this;
    var res = opt.res;
    var path = opt.path;
    var optHeaders = opt.headers;
    var content = opt.content;
    var version = opt.version; // allows explicit version of a file to be passed in for etag.
    var headers = _.clone(global);

    callback = oneCallback(callback);

    if (!path) {
      callback(new Error("options.path required"));
      return;
    }
    if (!res) {
      callback(new Error("options.res required"));
      return;
    }

    _.extend(headers, optHeaders);
    _.extend(headers, {
      'Content-Type': mime.lookup(path)
    });

    if (opt.etag) {
      headers.ETag = crypto.createHash('md5').update(version || content).digest('hex');
    }

    res.on('finish', function() {
      callback(null, {
        headers: headers
      })
    }).on('error', callback);
    res.writeHead(200, headers);
    res.end(content);
  }
});

module.exports = Static;