'use strict';
var path = require('path');
var nock = require('nock');
var test = require('ava');
var pathExists = require('path-exists');
var binBuild = require('../');
var fixture = path.join.bind(null, __dirname, 'fixtures');
var tmp = path.join(__dirname, 'tmp');

test('download and build source', function (t) {
	t.plan(2);

	var scope = nock('http://foo.com')
		.get('/gifsicle.tar.gz')
		.replyWithFile(200, fixture('test.tar.gz'));

	binBuild('http://foo.com/gifsicle.tar.gz', [
		'autoreconf -ivf',
		[
			'./configure --disable-gifview --disable-gifdiff',
			'--prefix="' + tmp + '" --bindir="' + tmp + '"'
		].join(' '),
		'make install'
	]).then(function () {
		t.assert(scope.isDone());
		t.assert(pathExists.sync(path.join(tmp, 'gifsicle')));
	});
});

test('build source from existing archive', function (t) {
	t.plan(1);

	binBuild(fixture('test.tar.gz'), [
		'autoreconf -ivf',
		[
			'./configure --disable-gifview --disable-gifdiff',
			'--prefix="' + tmp + '" --bindir="' + tmp + '"'
		].join(' '),
		'make install'
	]).then(function () {
		t.assert(pathExists.sync(path.join(tmp, 'gifsicle')));
	});
});
