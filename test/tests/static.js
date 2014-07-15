var App = require('mixdown-app').App;
var YourPlugin = require('../../index.js');
var assert = require('assert');
var path = require('path');
var fs = require('fs');
var path = require('path');
var MockResponse = require('hammock').Response;

suite('Static Plugin', function() {

  var app = new App();

  setup(function(done) {

    var p = new YourPlugin({
      etag: true,
      headers: {
        cats: 'meow'
      }
    });

    //attach it
    app.use(p, 'staticModule');
    app.setup(done);

  });

  test('send file', function(done) {
    var filepath = path.join(process.cwd(), './test/file.txt');
    var res = new MockResponse();
    var filecontent = fs.readFileSync(filepath);

    res.on('response', function(err, data) {
      assert.ifError(err, 'Should not error');
      console.log(data);

      assert.equal(res.getHeader('dogs'), 'bark', 'Should have set the dog header.');
      assert.equal(res.getHeader('cats'), 'meow', 'Should have set the cat header.');
      assert.ok(res.getHeader('ETag'), 'Should have set the etag header.');
      assert.equal(data.body, filecontent, 'File content should match response content.');

      done();
    });

    app.staticModule.file({
      path: filepath,
      res: res,
      headers: {
        dogs: 'bark',
        cats: 'meow'
      },
      etag: true
    }, function(err) {
      assert.ifError(err, 'Should not error');
    });

  });

});