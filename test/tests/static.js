var fs = require('fs');
var path = require('path');
var assert = require('assert');
var broadway = require('broadway');
var StaticPlugin = require('../../index.js');
var MockResponse = require('hammock').Response;

suite('Static Plugin', function() {

  var app = {
    plugins: new broadway.App()
  };
  var randomNamespace = (Math.floor(Math.random() * 1000)).toString();

  setup(function(done) {

    app.plugins.use(new StaticPlugin(randomNamespace), {
      etag: true,
      headers: {
        cats: 'meow'
      }
    });

    done();
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

    app.plugins[randomNamespace].file({
      path: filepath,
      res: res,
      headers: {
        dogs: 'bark'
      }
    }, function(err) {
      assert.ifError(err, 'Should not error');
    });

  });

});