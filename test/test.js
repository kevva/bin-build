'use strict';

var BinBuild = require('../');
var fs = require('fs');
var nock = require('nock');
var path = require('path');
var fixture = path.join.bind(null, __dirname, 'fixtures');
var test = require('ava');

test('expose a constructor', function (t) {
	t.plan(1);
	t.assert(typeof BinBuild === 'function');
});

test('set source file', function (t) {
	t.plan(1);

	var build = new BinBuild()
		.src('src.tar.gz');

	t.assert(build._src === 'src.tar.gz');
});

test('add commands to run', function (t) {
	t.plan(2);

	var build = new BinBuild()
		.cmd('make')
		.cmd('make install');

	t.assert(build._cmd[0] === 'make');
	t.assert(build._cmd[1] === 'make install');
});

test('download and build source', function (t) {
	t.plan(3);

	var tmp = path.join(__dirname, 'tmp');
	var scope = nock('http://foo.com')
		.get('/gifsicle.tar.gz')
		.replyWithFile(200, fixture('test.tar.gz'));

	new BinBuild()
		.src('http://foo.com/gifsicle.tar.gz')
		.cmd('autoreconf -ivf')
		.cmd([
			'./configure --disable-gifview --disable-gifdiff',
			'--prefix="' + tmp + '" --bindir="' + tmp + '"'
		].join(' '))
		.cmd('make install')
		.run(function (err) {
			t.assert(!err, err);
			t.assert(scope.isDone());
			t.assert(fs.existsSync(path.join(tmp, 'gifsicle')));
		});
});

test('build source from existing archive', function (t) {
	t.plan(3);

	var tmp = path.join(__dirname, 'tmp');
	var scope = nock('http://foo.com')
		.get('/gifsicle.tar.gz')
		.replyWithFile(200, fixture('test.tar.gz'));

	new BinBuild()
		.src(fixture('test.tar.gz'))
		.cmd('autoreconf -ivf')
		.cmd([
			'./configure --disable-gifview --disable-gifdiff',
			'--prefix="' + tmp + '" --bindir="' + tmp + '"'
		].join(' '))
		.cmd('make install')
		.run(function (err) {
			t.assert(!err, err);
			t.assert(scope.isDone());
			t.assert(fs.existsSync(path.join(tmp, 'gifsicle')));
		});
});

test('pass the command error to the callback', function (t) {
	t.plan(3);

	var scope = nock('http://foo.com')
		.get('/gifsicle.tar.gz')
		.replyWithFile(200, fixture('test.tar.gz'));

	var build = new BinBuild()
		.src('http://foo.com/gifsicle.tar.gz')
		.cmd('autoreconf -ivf')
		.cmd('unknown-command')
		.cmd('./configure')
		.cmd('make install');

	build.run(function (err) {
		t.assert(err);
		t.assert(err.message.indexOf(build.cmd().join(' && ')) !== -1);
		t.assert(scope.isDone());
	});
});
