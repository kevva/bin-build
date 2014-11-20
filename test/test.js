'use strict';

var BinBuild = require('../');
var Decompress = require('decompress');
var fs = require('fs');
var nock = require('nock');
var path = require('path');
var fixture = path.join.bind(null, __dirname, 'fixtures');
var rm = require('rimraf');
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
	t.plan(2);

	nock('http://foo.com')
		.get('/gifsicle.tar.gz')
		.replyWithFile(200, fixture('test.tar.gz'));

	var tmp = path.join(__dirname, 'tmp');
	var cmd = [
		'./configure --disable-gifview --disable-gifdiff',
		'--prefix="' + tmp + '" --bindir="' + tmp + '"'
	].join(' ');

	var build = new BinBuild()
		.src('http://foo.com/gifsicle.tar.gz')
		.cmd('autoreconf -ivf')
		.cmd(cmd)
		.cmd('make install');

	build.run(function (err) {
		t.assert(!err, err);
		fs.exists(path.join(tmp, 'gifsicle'), t.assert.bind(t));
	});
});

test('build source from existing archive', function (t) {
	t.plan(2);

	var tmp = path.join(__dirname, 'tmp');
	var cmd = [
		'./configure --disable-gifview --disable-gifdiff',
		'--prefix="' + tmp + '" --bindir="' + tmp + '"'
	].join(' ');

	var build = new BinBuild()
		.src(fixture('test.tar.gz'))
		.cmd('autoreconf -ivf')
		.cmd(cmd)
		.cmd('make install');

	build.run(function (err) {
		t.assert(!err, err);
		fs.exists(path.join(tmp, 'gifsicle'), t.assert.bind(t));
	});
});

test('build source from existing folder', function (t) {
	t.plan(4);

	var decompress = new Decompress({
		mode: '777',
		strip: 1
	});

	decompress.src(fixture('test.tar.gz'));
	decompress.dest(fixture('test-directory'));
	decompress.run(function (err) {
		t.assert(!err, err);

		var tmp = path.join(__dirname, 'tmp');
		var cmd = [
			'./configure --disable-gifview --disable-gifdiff',
			'--prefix="' + tmp + '" --bindir="' + tmp + '"'
		].join(' ');

		var build = new BinBuild()
			.src(fixture('test-directory'))
			.cmd('autoreconf -ivf')
			.cmd(cmd)
			.cmd('make install');

		build.run(function (err) {
			t.assert(!err, err);

			fs.exists(path.join(tmp, 'gifsicle'), function (exists) {
				t.assert(exists);

				rm(fixture('test-directory'), function (err) {
					t.assert(!err, err);
				});
			});
		});
	});
});

test('pass the command error to the callback', function (t) {
	t.plan(1);

	nock('http://foo.com')
		.get('/gifsicle.tar.gz')
		.replyWithFile(200, fixture('test.tar.gz'));

	var build = new BinBuild()
		.src('http://foo.com/gifsicle.tar.gz')
		.cmd('autoreconf -ivf')
		.cmd('unknown-command')
		.cmd('./configure')
		.cmd('make install');

	build.run(t.assert.bind(t));
});
